// Contenido de ejemplo para la Academia del Constructor (marcas e instructores ficticios).

// Video de muestra (Big Buck Bunny, Blender Foundation). Reemplácelo desde el admin por los videos reales de cada lección.
export const SAMPLE_VIDEO = "aqz-KE-bpKQ";

export const categories = [
  { slug: "concreto-y-cemento", name: "Concreto y cemento", description: "Dosificación, colado, curado y control de calidad del concreto." },
  { slug: "mamposteria-y-bloques", name: "Mampostería y bloques", description: "Bloques de concreto, ladrillo, morteros y refuerzo de muros." },
  { slug: "impermeabilizacion", name: "Impermeabilización", description: "Losas, azoteas, cimientos, baños y tanques." },
  { slug: "aislamiento", name: "Aislamiento térmico y acústico", description: "Confort, ahorro energético y control de ruido." },
  { slug: "construccion-en-seco", name: "Construcción en seco", description: "Tablayeso, fibrocemento y perfilería metálica." },
  { slug: "techos-y-cubiertas", name: "Techos y cubiertas", description: "Láminas, tejas, canales y bajantes." },
  { slug: "pinturas-y-recubrimientos", name: "Pinturas y recubrimientos", description: "Preparación de superficies y sistemas de pintura." },
  { slug: "instalaciones-hidrosanitarias", name: "Instalaciones hidrosanitarias", description: "Agua potable, drenajes y ventilación." },
];

export const brands = [
  {
    slug: "cementos-del-valle",
    name: "Cementos del Valle",
    color: "#64748b",
    website: "https://example.com/cementos-del-valle",
    description:
      "Fabricante de cemento de uso general y concreto premezclado. Acompaña a constructores de la región con asistencia técnica en obra y laboratorio de control de calidad.",
    sheets: [
      { title: "Cemento de uso general tipo GU", product: "Cemento GU 42.5 kg", category: "concreto-y-cemento" },
      { title: "Concreto premezclado 210 kg/cm²", product: "Concreto f'c 210", category: "concreto-y-cemento" },
    ],
  },
  {
    slug: "bloquetec",
    name: "BloqueTec",
    color: "#a16207",
    website: "https://example.com/bloquetec",
    description:
      "Bloques de concreto vibrocompactados para muros de carga y divisorios, con control dimensional y de resistencia en cada lote.",
    sheets: [{ title: "Bloque de concreto 15×20×40 cm", product: "Bloque estructural 15", category: "mamposteria-y-bloques" }],
  },
  {
    slug: "hidroseal",
    name: "Hidroseal",
    color: "#0369a1",
    website: "https://example.com/hidroseal",
    description:
      "Sistemas de impermeabilización acrílicos, asfálticos y cementicios para losas, azoteas, muros y cimentaciones en clima tropical.",
    sheets: [
      { title: "Impermeabilizante acrílico elastomérico 5 años", product: "Hidroseal Acril 5", category: "impermeabilizacion" },
      { title: "Membrana asfáltica prefabricada 3 mm", product: "Hidroseal Manto 3", category: "impermeabilizacion" },
    ],
  },
  {
    slug: "aislatec",
    name: "Aislatec",
    color: "#15803d",
    website: "https://example.com/aislatec",
    description: "Paneles de tablayeso, perfilería galvanizada y aislantes de fibra mineral para construcción en seco.",
    sheets: [
      { title: "Panel de tablayeso estándar 1/2\"", product: "Tablayeso ST 12.7 mm", category: "construccion-en-seco" },
      { title: "Colchoneta de fibra mineral 2\"", product: "Aislatec FM 50", category: "aislamiento" },
    ],
  },
  {
    slug: "laminas-istmo",
    name: "Láminas Istmo",
    color: "#b91c1c",
    website: "https://example.com/laminas-istmo",
    description: "Láminas de acero galvanizado y aluzinc, canales y accesorios para techos residenciales e industriales.",
    sheets: [{ title: "Lámina troquelada aluzinc calibre 26", product: "Istmo Tr-26", category: "techos-y-cubiertas" }],
  },
];

export const instructors = [
  { key: "zelaya", name: "Ing. María Fernanda Zelaya", title: "Ingeniera civil, especialista en tecnología del concreto", bio: "Más de 15 años en control de calidad de concreto y supervisión de obras en Honduras y El Salvador." },
  { key: "mejia", name: "Arq. Carlos Mejía", title: "Arquitecto, consultor en envolventes y confort térmico", bio: "Diseña y supervisa proyectos de vivienda con criterios de eficiencia energética para clima tropical." },
  { key: "andino", name: "Téc. José Luis Andino", title: "Técnico en construcción y capacitador de oficios", bio: "Capacitador de albañiles y maestros de obra en técnicas de mampostería e impermeabilización." },
];

type SeedLesson = { title: string; minutes: number; preview?: boolean; content: string };
type SeedQuestion = { prompt: string; options: string[]; correct: number; explanation?: string };
type SeedModule = { title: string; lessons: SeedLesson[]; quiz?: { title: string; questions: SeedQuestion[] } };
export type SeedCourse = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: "INICIAL" | "INTERMEDIO" | "AVANZADO";
  minutes: number;
  category: string;
  instructor: string;
  sponsors: string[];
  featured?: boolean;
  color: string;
  modules: SeedModule[];
  finalQuiz: { title: string; passingScore: number; questions: SeedQuestion[] };
};

export const courses: SeedCourse[] = [
  {
    slug: "concreto-en-obra-dosificacion-colado-y-curado",
    title: "Concreto en obra: dosificación, colado y curado",
    summary: "Aprenda a preparar, colocar y curar concreto hecho en obra para lograr la resistencia especificada.",
    description: `Un curso práctico para maestros de obra, técnicos y profesionales que preparan concreto en obra.

## Qué aprenderá
- Seleccionar y almacenar correctamente cemento, arena, grava y agua.
- Dosificar por volumen con cajones medidores y controlar la relación agua/cemento.
- Colar, vibrar y curar elementos estructurales.
- Tomar muestras y realizar la prueba de revenimiento.

Al finalizar obtendrá un **certificado digital verificable**.`,
    level: "INICIAL",
    minutes: 180,
    category: "concreto-y-cemento",
    instructor: "zelaya",
    sponsors: ["cementos-del-valle"],
    featured: true,
    color: "#475569",
    modules: [
      {
        title: "Materiales del concreto",
        lessons: [
          {
            title: "El cemento: tipos, almacenamiento y vida útil",
            minutes: 12,
            preview: true,
            content: `El cemento es el material que, al reaccionar con el agua, une los agregados y le da resistencia al concreto.

## Puntos clave
- Almacene los sacos sobre tarimas, separados al menos **10 cm del piso** y de las paredes.
- No apile más de **10 sacos** de alto para evitar que se compacten.
- Use primero los sacos más antiguos ("primero en entrar, primero en salir").
- Un saco con grumos que no se deshacen con la mano ya se hidrató parcialmente: no lo use en elementos estructurales.`,
          },
          {
            title: "Agregados y agua de mezclado",
            minutes: 15,
            content: `La arena y la grava ocupan cerca del 70 % del volumen del concreto, por eso su calidad es decisiva.

- Los agregados deben estar **limpios**, sin arcilla, materia orgánica ni basura.
- La grava para elementos estructurales normalmente no supera **3/4"** (19 mm).
- El agua debe ser **potable** o al menos limpia; el agua de mar o con aceites debilita el concreto y corroe el acero.`,
          },
        ],
      },
      {
        title: "Dosificación y mezclado",
        lessons: [
          {
            title: "Dosificación por volumen con cajones medidores",
            minutes: 18,
            content: `Medir con palas genera mucha variación. Use **cajones medidores** de 30 × 30 × 39 cm (equivalentes a un saco de cemento).

1. Defina la proporción según la resistencia requerida (por ejemplo 1 : 2 : 3 para f'c ≈ 210 kg/cm²).
2. Llene los cajones al ras, sin compactar.
3. Agregue el agua de forma gradual y **registre la cantidad** para repetirla en cada mezcla.`,
          },
          {
            title: "La relación agua/cemento y la prueba de revenimiento",
            minutes: 16,
            content: `Cada litro de agua de más reduce la resistencia. Agregar agua para "facilitar" el colado es el error más común en obra.

La **prueba de revenimiento** (cono de Abrams) mide la consistencia: se llena el cono en tres capas, cada una con 25 varillazos, se levanta el cono y se mide cuánto baja la mezcla. Para losas y vigas un revenimiento de **8 a 10 cm** suele ser adecuado.`,
          },
        ],
        quiz: {
          title: "Repaso: dosificación",
          questions: [
            {
              prompt: "¿Qué ocurre si se agrega agua extra a la mezcla para facilitar el colado?",
              options: ["Aumenta la resistencia", "Disminuye la resistencia", "No cambia nada", "Fragua más rápido"],
              correct: 1,
              explanation: "Más agua aumenta la relación agua/cemento y reduce la resistencia y durabilidad.",
            },
            {
              prompt: "¿Para qué se usa el cono de Abrams?",
              options: ["Medir la resistencia final", "Medir la consistencia (revenimiento)", "Medir el contenido de aire", "Pesar el cemento"],
              correct: 1,
            },
          ],
        },
      },
      {
        title: "Colado y curado",
        lessons: [
          {
            title: "Colado y vibrado de elementos estructurales",
            minutes: 20,
            content: `- Humedezca la formaleta y retire basura antes de colar.
- No deje caer el concreto desde más de **1.5 m** de altura: se separan los agregados.
- Vibre en puntos separados unos 50 cm, sin tocar el acero ni la formaleta, hasta que deje de salir aire.`,
          },
          {
            title: "Curado: el paso que más se olvida",
            minutes: 14,
            content: `El curado mantiene la humedad para que el cemento siga reaccionando. En clima cálido es crítico.

- Inicie el curado apenas el concreto endurezca superficialmente.
- Mantenga la superficie húmeda **al menos 7 días** (riego, sacos mojados o membrana de curado).
- Un concreto sin curar puede perder hasta un **30 %** de su resistencia potencial.`,
          },
        ],
      },
    ],
    finalQuiz: {
      title: "Evaluación final",
      passingScore: 70,
      questions: [
        {
          prompt: "¿A qué distancia mínima del piso deben almacenarse los sacos de cemento?",
          options: ["No importa", "5 cm", "10 cm sobre tarimas", "1 m"],
          correct: 2,
        },
        {
          prompt: "¿Cuál es la ventaja de usar cajones medidores?",
          options: ["Son más baratos que las palas", "Reducen la variación entre mezclas", "Aumentan el revenimiento", "Evitan el curado"],
          correct: 1,
        },
        {
          prompt: "¿Desde qué altura máxima se recomienda dejar caer el concreto?",
          options: ["0.5 m", "1.5 m", "3 m", "Cualquier altura si se vibra"],
          correct: 1,
        },
        {
          prompt: "¿Cuántos días mínimo se recomienda curar el concreto?",
          options: ["1 día", "3 días", "7 días", "No hace falta en clima cálido"],
          correct: 2,
        },
        {
          prompt: "¿Qué tipo de agua es adecuada para el mezclado?",
          options: ["Agua de mar", "Agua potable o limpia", "Agua con aceite", "Cualquier agua"],
          correct: 1,
        },
      ],
    },
  },
  {
    slug: "bloque-de-concreto-seleccion-pegado-y-refuerzo",
    title: "Bloque de concreto: selección, pegado y refuerzo",
    summary: "Construya muros de bloque resistentes a sismos: selección del bloque, mortero, nivelación y refuerzo.",
    description: `Curso orientado a albañiles, maestros de obra y técnicos que levantan muros de bloque de concreto.

## Contenido
- Tipos de bloque y control de calidad en la entrega.
- Preparación del mortero y espesor de las juntas.
- Plomo, nivel y trabado.
- Refuerzo vertical y horizontal, soleras y castillos.`,
    level: "INICIAL",
    minutes: 150,
    category: "mamposteria-y-bloques",
    instructor: "andino",
    sponsors: ["bloquetec", "cementos-del-valle"],
    featured: true,
    color: "#a16207",
    modules: [
      {
        title: "El bloque y el mortero",
        lessons: [
          {
            title: "Cómo recibir y revisar una entrega de bloques",
            minutes: 10,
            preview: true,
            content: `Antes de aceptar una entrega revise una muestra de cada lote:

- **Dimensiones** uniformes (por ejemplo 15 × 20 × 40 cm) y aristas completas.
- Sin fisuras ni desmoronamiento al frotar con la mano.
- Sonido "metálico" al golpear dos bloques: un sonido sordo indica bloque débil o húmedo.`,
          },
          {
            title: "Mortero de pega: proporción y espesor de juntas",
            minutes: 14,
            content: `Un mortero de pega típico es **1 : 3** (cemento : arena) o 1 : 4 para muros no estructurales.

- Prepare solo lo que usará en **2 horas** aproximadamente.
- Juntas horizontales y verticales de **1 cm**; juntas más gruesas debilitan el muro.
- No moje en exceso los bloques de concreto: basta con limpiar el polvo.`,
          },
        ],
      },
      {
        title: "Levantado y refuerzo",
        lessons: [
          {
            title: "Plomo, nivel y trabado de hiladas",
            minutes: 16,
            content: `1. Trace el muro y coloque los bloques de esquina primero.
2. Tienda un **hilo** entre esquinas para cada hilada.
3. Trabe las juntas verticales a medio bloque.
4. Verifique plomo y nivel cada tres hiladas.`,
          },
          {
            title: "Refuerzo vertical, soleras y castillos",
            minutes: 20,
            content: `En zonas sísmicas como Centroamérica el refuerzo es indispensable.

- Coloque varillas verticales en las celdas indicadas en planos y **rellene con concreto fluido (grout)**.
- Use refuerzo horizontal o bloques solera según el diseño.
- Amarre castillos y soleras para que el muro trabaje como una unidad.`,
          },
        ],
      },
    ],
    finalQuiz: {
      title: "Evaluación final",
      passingScore: 70,
      questions: [
        { prompt: "¿Qué espesor de junta se recomienda para muros de bloque?", options: ["0.5 cm", "1 cm", "3 cm", "5 cm"], correct: 1 },
        {
          prompt: "¿Qué indica un sonido sordo al golpear dos bloques?",
          options: ["Bloque de buena calidad", "Bloque débil o húmedo", "Bloque hueco normal", "Nada"],
          correct: 1,
        },
        {
          prompt: "¿Con qué se rellenan las celdas que llevan varilla vertical?",
          options: ["Arena seca", "Mortero de pega", "Concreto fluido (grout)", "Se dejan vacías"],
          correct: 2,
        },
        {
          prompt: "¿Cada cuántas hiladas conviene verificar plomo y nivel?",
          options: ["Solo al final", "Cada tres hiladas", "Cada diez hiladas", "Nunca"],
          correct: 1,
        },
      ],
    },
  },
  {
    slug: "impermeabilizacion-de-losas-y-azoteas",
    title: "Impermeabilización de losas y azoteas",
    summary: "Diagnóstico, preparación de superficie y aplicación de sistemas acrílicos y asfálticos en clima tropical.",
    description: `Las filtraciones son una de las principales causas de reclamo en vivienda. En este curso aprenderá a elegir y aplicar el sistema adecuado.

## Temas
- Diagnóstico de filtraciones y pendientes.
- Preparación de superficie y detalles críticos (bajantes, pretiles, juntas).
- Sistemas acrílicos elastoméricos y membranas asfálticas.`,
    level: "INTERMEDIO",
    minutes: 120,
    category: "impermeabilizacion",
    instructor: "andino",
    sponsors: ["hidroseal"],
    color: "#0369a1",
    modules: [
      {
        title: "Diagnóstico y preparación",
        lessons: [
          {
            title: "Por qué se filtra una losa",
            minutes: 12,
            preview: true,
            content: `Las causas más frecuentes son:

- **Pendiente insuficiente**: el agua se estanca. Se recomienda al menos **2 %** hacia los desagües.
- Fisuras por contracción o movimiento térmico.
- Detalles mal resueltos en bajantes, pretiles y bases de equipos.`,
          },
          {
            title: "Preparación de la superficie",
            minutes: 15,
            content: `- Retire impermeabilizante suelto, polvo, grasa y hongos.
- Abra y selle fisuras con sellador elastomérico.
- Aplique **primario** según la ficha técnica y respete el tiempo de secado.`,
          },
        ],
      },
      {
        title: "Aplicación de sistemas",
        lessons: [
          {
            title: "Sistema acrílico elastomérico con malla de refuerzo",
            minutes: 18,
            content: `1. Refuerce primero los puntos críticos con malla de poliéster.
2. Aplique la primera mano y coloque la malla en toda la superficie, sin arrugas.
3. Aplique la segunda mano en sentido cruzado cuando la primera esté seca al tacto.

Respete el **rendimiento por m²** indicado en la ficha técnica: aplicar menos producto reduce la vida útil.`,
          },
          {
            title: "Membrana asfáltica prefabricada",
            minutes: 20,
            content: `- Desenrolle y alinee la membrana antes de termofusionar.
- Traslapes de **10 cm** como mínimo, en el sentido del escurrimiento del agua.
- Proteja la membrana de la radiación UV si no trae acabado mineral.`,
          },
        ],
      },
    ],
    finalQuiz: {
      title: "Evaluación final",
      passingScore: 70,
      questions: [
        { prompt: "¿Qué pendiente mínima se recomienda hacia los desagües?", options: ["0 %", "0.5 %", "2 %", "10 %"], correct: 2 },
        {
          prompt: "¿Qué se debe hacer con las fisuras antes de impermeabilizar?",
          options: ["Ignorarlas", "Abrirlas y sellarlas", "Cubrirlas con pintura", "Mojarlas"],
          correct: 1,
        },
        {
          prompt: "¿Cómo se aplica la segunda mano de un sistema acrílico?",
          options: ["En el mismo sentido inmediatamente", "En sentido cruzado cuando la primera esté seca al tacto", "Diluida con agua", "No es necesaria"],
          correct: 1,
        },
        {
          prompt: "¿Cuál es el traslape mínimo recomendado en membranas asfálticas?",
          options: ["2 cm", "5 cm", "10 cm", "No requieren traslape"],
          correct: 2,
        },
      ],
    },
  },
  {
    slug: "construccion-en-seco-con-tablayeso",
    title: "Construcción en seco con tablayeso",
    summary: "Divisiones y cielos falsos con perfilería galvanizada y tablayeso: trazo, estructura, emplacado y acabado.",
    description: `Aprenda a construir divisiones livianas y cielos falsos con sistemas de construcción en seco, más rápidos y limpios que la mampostería tradicional.

## Incluye
- Componentes del sistema: paneles, perfiles, tornillos y cintas.
- Trazo y armado de la estructura.
- Emplacado, tratamiento de juntas y aislamiento acústico.`,
    level: "INTERMEDIO",
    minutes: 140,
    category: "construccion-en-seco",
    instructor: "mejia",
    sponsors: ["aislatec"],
    color: "#15803d",
    modules: [
      {
        title: "Sistema y estructura",
        lessons: [
          {
            title: "Componentes del sistema",
            minutes: 12,
            preview: true,
            content: `- **Paneles de tablayeso**: estándar, resistente a la humedad (verde) y resistente al fuego.
- **Perfiles galvanizados**: canales (piso y techo) y postes.
- Tornillos autorroscantes, cinta de papel o malla y masilla para juntas.`,
          },
          {
            title: "Trazo y armado de la estructura",
            minutes: 18,
            content: `1. Trace la división en piso y trasládela al techo con plomada o nivel láser.
2. Fije los canales cada **60 cm** como máximo.
3. Coloque postes cada **40 o 61 cm** según el diseño y la altura.`,
          },
        ],
      },
      {
        title: "Emplacado y acabado",
        lessons: [
          {
            title: "Emplacado y atornillado",
            minutes: 16,
            content: `- Coloque los paneles en vertical, con juntas sobre los postes.
- Atornille cada **25–30 cm** en el centro del panel y cada 20 cm en bordes.
- La cabeza del tornillo debe quedar ligeramente hundida sin romper el papel.`,
          },
          {
            title: "Tratamiento de juntas y aislamiento acústico",
            minutes: 18,
            content: `- Aplique masilla, cinta y dos manos adicionales de masilla, lijando entre manos.
- Para mejorar el aislamiento acústico rellene la cavidad con **colchoneta de fibra mineral** y selle el perímetro.`,
          },
        ],
      },
    ],
    finalQuiz: {
      title: "Evaluación final",
      passingScore: 70,
      questions: [
        {
          prompt: "¿Qué panel se recomienda para baños y zonas húmedas?",
          options: ["Estándar", "Resistente a la humedad", "Cualquier panel pintado", "Panel de madera"],
          correct: 1,
        },
        { prompt: "¿Dónde deben coincidir las juntas entre paneles?", options: ["Entre postes", "Sobre los postes", "En el piso", "No importa"], correct: 1 },
        {
          prompt: "¿Qué material mejora el aislamiento acústico de una división?",
          options: ["Fibra mineral en la cavidad", "Pintura de aceite", "Más tornillos", "Cinta de papel"],
          correct: 0,
        },
        {
          prompt: "¿Cómo debe quedar la cabeza del tornillo?",
          options: ["Sobresaliendo", "Ligeramente hundida sin romper el papel", "Atravesando el panel", "Cubierta con cinta"],
          correct: 1,
        },
      ],
    },
  },
  {
    slug: "techos-de-lamina-instalacion-y-prevencion-de-filtraciones",
    title: "Techos de lámina: instalación y prevención de filtraciones",
    summary: "Instale techos de lámina metálica durables: pendientes, traslapes, fijación y manejo de aguas lluvias.",
    description: `Curso práctico sobre la instalación de techos de lámina de acero galvanizado o aluzinc, muy utilizados en la región.

## Temas
- Selección de lámina y calibre.
- Pendientes, traslapes y fijación.
- Canales, bajantes y detalles contra filtraciones.`,
    level: "INICIAL",
    minutes: 90,
    category: "techos-y-cubiertas",
    instructor: "andino",
    sponsors: ["laminas-istmo"],
    color: "#b91c1c",
    modules: [
      {
        title: "Instalación",
        lessons: [
          {
            title: "Calibres, pendientes y traslapes",
            minutes: 14,
            preview: true,
            content: `- A menor número de calibre, mayor espesor de la lámina (calibre 24 es más grueso que 26).
- Respete la **pendiente mínima** del fabricante (frecuentemente 10–15 % para lámina troquelada).
- Traslape lateral de al menos una onda o greca y traslape longitudinal de **20 cm** o más.`,
          },
          {
            title: "Fijación correcta",
            minutes: 12,
            content: `- Use tornillos autorroscantes con **arandela de neopreno**.
- Fije en la parte alta de la onda en zonas de traslape, o según recomiende el fabricante.
- No apriete en exceso: la arandela debe comprimirse sin deformarse.`,
          },
          {
            title: "Canales y bajantes",
            minutes: 12,
            content: `Dimensione canales y bajantes para las lluvias intensas de la región. Como referencia práctica, coloque un bajante de **3"** por cada 50–70 m² de techo y limpie las canales antes de cada temporada de lluvia.`,
          },
        ],
      },
    ],
    finalQuiz: {
      title: "Evaluación final",
      passingScore: 70,
      questions: [
        { prompt: "¿Qué lámina es más gruesa?", options: ["Calibre 26", "Calibre 24", "Son iguales", "Depende del color"], correct: 1 },
        {
          prompt: "¿Qué debe llevar el tornillo de fijación?",
          options: ["Arandela de neopreno", "Nada", "Silicón únicamente", "Clavo adicional"],
          correct: 0,
        },
        {
          prompt: "¿Qué traslape longitudinal mínimo se recomienda?",
          options: ["5 cm", "10 cm", "20 cm", "No se traslapa"],
          correct: 2,
        },
      ],
    },
  },
];

const day = 86400_000;
export function events(now = Date.now()) {
  const at = (days: number, hourLocal: number, offsetHours = 6) => {
    const d = new Date(now + days * day);
    d.setUTCHours(hourLocal + offsetHours, 0, 0, 0);
    return d;
  };
  return [
    {
      slug: "taller-practico-impermeabilizacion-de-losas-tegucigalpa",
      title: "Taller práctico: impermeabilización de losas",
      summary: "Demostración en vivo de preparación de superficie y aplicación de sistemas acrílicos con malla de refuerzo.",
      description: `Taller práctico en el que cada participante aplicará un sistema de impermeabilización sobre una losa de prueba.

## Agenda
- 8:00 a. m. Registro y café
- 8:30 a. m. Diagnóstico de filtraciones
- 10:00 a. m. Práctica guiada
- 11:30 a. m. Preguntas y cierre

Se recomienda llevar ropa de trabajo. Cupos limitados.`,
      startsAt: at(14, 8),
      endsAt: at(14, 12),
      timezone: "America/Tegucigalpa",
      venueName: "Centro de Capacitación Hidroseal",
      address: "Bulevar Suyapa, frente a la colonia Florencia",
      city: "Tegucigalpa",
      department: "Francisco Morazán",
      country: "HN",
      capacity: 30,
      category: "impermeabilizacion",
      sponsors: ["hidroseal"],
      color: "#0369a1",
    },
    {
      slug: "jornada-tecnica-concreto-premezclado-san-pedro-sula",
      title: "Jornada técnica de concreto premezclado",
      summary: "Control de calidad, recepción en obra y bombeo de concreto premezclado. Incluye visita a planta.",
      description: `Jornada para ingenieros, maestros de obra y contratistas sobre el uso de concreto premezclado.

## Temas
- Pedido y programación de colados.
- Recepción en obra: revenimiento y toma de cilindros.
- Bombeo y colocación.
- Visita guiada a la planta de producción.`,
      startsAt: at(28, 8),
      endsAt: at(28, 15),
      timezone: "America/Tegucigalpa",
      venueName: "Planta Cementos del Valle",
      address: "Carretera a Puerto Cortés, km 6",
      city: "San Pedro Sula",
      department: "Cortés",
      country: "HN",
      capacity: 80,
      category: "concreto-y-cemento",
      sponsors: ["cementos-del-valle"],
      color: "#475569",
    },
    {
      slug: "demostracion-construccion-en-seco-san-salvador",
      title: "Demostración de sistemas de construcción en seco",
      summary: "Armado en vivo de una división acústica y un cielo falso. Cupo muy limitado.",
      description: `Demostración práctica de armado de divisiones y cielos falsos con tablayeso y aislamiento de fibra mineral.

Cupo muy limitado para garantizar la práctica de cada participante.`,
      startsAt: at(21, 14),
      endsAt: at(21, 17),
      timezone: "America/El_Salvador",
      venueName: "Sala de exhibición Aislatec",
      address: "Boulevard del Hipódromo, colonia San Benito",
      city: "San Salvador",
      department: "San Salvador",
      country: "SV",
      capacity: 2,
      category: "construccion-en-seco",
      sponsors: ["aislatec"],
      color: "#15803d",
    },
  ];
}
