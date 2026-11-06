// Drivers de almacenamiento (sin dependencias de Next, usables también desde el seed).
import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

export interface StoredFile {
  stream: ReadableStream<Uint8Array>;
  size?: number;
}

export interface StorageDriver {
  put(key: string, data: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<StoredFile | null>;
  delete(key: string): Promise<void>;
  /** URL firmada para descargar directamente del bucket (solo S3). */
  signedUrl?(key: string, downloadName?: string): Promise<string>;
}

const KEY_RE = /^[a-z0-9][a-z0-9/_.-]*$/i;

export function assertSafeKey(key: string) {
  if (!KEY_RE.test(key) || key.includes("..") || key.includes("//")) throw new Error("Clave de archivo inválida");
}

export class LocalDriver implements StorageDriver {
  private root: string;
  constructor(dir: string) {
    this.root = path.resolve(dir);
  }
  private resolve(key: string) {
    assertSafeKey(key);
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error("Clave de archivo inválida");
    return full;
  }
  async put(key: string, data: Uint8Array) {
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
  }
  async get(key: string) {
    const full = this.resolve(key);
    try {
      const s = await stat(full);
      if (!s.isFile()) return null;
      return { stream: Readable.toWeb(createReadStream(full)) as ReadableStream<Uint8Array>, size: s.size };
    } catch {
      return null;
    }
  }
  async delete(key: string) {
    await rm(this.resolve(key), { force: true });
  }
}

export type S3Config = {
  region: string;
  endpoint?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

export class S3Driver implements StorageDriver {
  private clientPromise;
  private bucket: string;
  constructor(cfg: S3Config) {
    this.bucket = cfg.bucket ?? "";
    this.clientPromise = (async () => {
      const { S3Client } = await import("@aws-sdk/client-s3");
      return new S3Client({
        region: cfg.region,
        endpoint: cfg.endpoint || undefined,
        credentials: { accessKeyId: cfg.accessKeyId ?? "", secretAccessKey: cfg.secretAccessKey ?? "" },
      });
    })();
  }

  async put(key: string, data: Uint8Array, contentType: string) {
    assertSafeKey(key);
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    await (await this.clientPromise).send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: data, ContentType: contentType }));
  }
  async get(key: string) {
    assertSafeKey(key);
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    try {
      const res = await (await this.clientPromise).send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      if (!res.Body) return null;
      return { stream: res.Body.transformToWebStream() as ReadableStream<Uint8Array>, size: res.ContentLength };
    } catch {
      return null;
    }
  }
  async delete(key: string) {
    assertSafeKey(key);
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    await (await this.clientPromise).send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
  async signedUrl(key: string, downloadName?: string) {
    assertSafeKey(key);
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    return getSignedUrl(
      await this.clientPromise,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: downloadName ? `attachment; filename="${downloadName}"` : undefined,
      }),
      { expiresIn: 300 },
    );
  }
}

/** Cliente mínimo que necesita DbDriver (compatible con PrismaClient). */
export type StoredFileClient = {
  storedFile: {
    upsert(args: {
      where: { key: string };
      create: { key: string; contentType: string; size: number; data: Uint8Array<ArrayBuffer> };
      update: { contentType: string; size: number; data: Uint8Array<ArrayBuffer> };
    }): Promise<unknown>;
    findUnique(args: { where: { key: string } }): Promise<{ data: Uint8Array; size: number } | null>;
    deleteMany(args: { where: { key: string } }): Promise<unknown>;
  };
};

/** Guarda los archivos en PostgreSQL (tabla stored_file). Ideal para hosting sin disco persistente (Vercel). */
export class DbDriver implements StorageDriver {
  constructor(private client: StoredFileClient) {}
  async put(key: string, data: Uint8Array, contentType: string) {
    assertSafeKey(key);
    const bytes = new Uint8Array(data.byteLength);
    bytes.set(data);
    await this.client.storedFile.upsert({
      where: { key },
      create: { key, contentType, size: bytes.byteLength, data: bytes },
      update: { contentType, size: bytes.byteLength, data: bytes },
    });
  }
  async get(key: string) {
    assertSafeKey(key);
    const row = await this.client.storedFile.findUnique({ where: { key } });
    if (!row) return null;
    const data = row.data;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(data));
        controller.close();
      },
    });
    return { stream, size: row.size };
  }
  async delete(key: string) {
    assertSafeKey(key);
    await this.client.storedFile.deleteMany({ where: { key } });
  }
}

type DriverEnv = Record<string, unknown> &
  Partial<
    Record<
      "STORAGE_DRIVER" | "S3_REGION" | "S3_ENDPOINT" | "S3_BUCKET" | "S3_ACCESS_KEY_ID" | "S3_SECRET_ACCESS_KEY" | "STORAGE_LOCAL_DIR",
      string
    >
  >;

export function createDriver(
  e: DriverEnv,
  client?: StoredFileClient,
): StorageDriver {
  if (e.STORAGE_DRIVER === "db") {
    if (!client) throw new Error("STORAGE_DRIVER=db requiere un cliente de base de datos");
    return new DbDriver(client);
  }
  return e.STORAGE_DRIVER === "s3"
    ? new S3Driver({
        region: e.S3_REGION ?? "auto",
        endpoint: e.S3_ENDPOINT,
        bucket: e.S3_BUCKET,
        accessKeyId: e.S3_ACCESS_KEY_ID,
        secretAccessKey: e.S3_SECRET_ACCESS_KEY,
      })
    : new LocalDriver(e.STORAGE_LOCAL_DIR ?? "./storage");
}
