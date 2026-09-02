/* ============================================================================
   TELURIO — datos.js
   ----------------------------------------------------------------------------
   DATOS DE DEMOSTRACIÓN. Replican el contenido de las maquetas.

   >>> TODO BACKEND: cada constante de este archivo representa la respuesta de
   un endpoint. Reemplazar por fetch() cuando exista la API:
     - CURSOS               → GET /api/cursos
     - ACTIVIDADES_PENDIENTES → GET /api/alumno/actividades
     - RANKING              → GET /api/tabla?curso=...
     - TEMAS_FORO_DEMO      → GET /api/foro/temas
     - PRODUCTOS_TIENDA     → GET /api/tienda/productos
     - NIVELES_CRUCIGRAMA   → GET /api/juego/niveles?curso=...&semana=...
   ========================================================================== */

/** Cursos del alumno (actual y archivados). */
const CURSOS = {
  q3: {
    id: "q3",
    nombre: "Química 3er año",
    ciclo: "CICLO ACTUAL 2026",
    profesor: "Osvaldo Onana",
    actual: true,
    semanasDesbloqueadas: 4, // semanas 1 a 4 con contenido cargado
    totalSemanas: 8,
  },
  q2: {
    id: "q2",
    nombre: "Química 2do año",
    ciclo: "CICLO 2025",
    profesor: "Luciano Vera",
    actual: false,
    semanasDesbloqueadas: 8, // curso archivado: todo disponible para repasar
    totalSemanas: 8,
  },
};

/** Actividades del panel de inicio (estado: "hecha" | "disponible" | "bloqueada"). */
const ACTIVIDADES_PENDIENTES = [
  { materia: "Química 2do", semana: 1, estado: "hecha",      curso: "q2" },
  { materia: "Química 3ro", semana: 1, estado: "hecha",      curso: "q3" },
  { materia: "Química 3ro", semana: 2, estado: "disponible", curso: "q3" },
  { materia: "Química 4to", semana: 6, estado: "bloqueada",  curso: null },
];

/** Resumen de progreso del bimestre para el panel de inicio. */
const PROGRESO_BIMESTRE = { hechas: 3, faltantes: 5 };

/** Tabla de competición (mockup: multiplicadores y puntos por alumno). */
const RANKING = [
  { nombre: "Alumno3", multiplicador: 2,    puntos: 1586 },
  { nombre: "Alumno7", multiplicador: 2,    puntos: 1490 },
  { nombre: "Alumno2", multiplicador: 1.5,  puntos: 1485 },
  { nombre: "Alumno1", multiplicador: null, puntos: 1480 },
  { nombre: "Alumno8", multiplicador: null, puntos: 1476 },
  { nombre: "Alumno5", multiplicador: null, puntos: 1467 },
  { nombre: "Alumno4", multiplicador: null, puntos: 1455 },
  { nombre: "Alumno6", multiplicador: null, puntos: 1424 },
];

/** Temas iniciales del foro (los nuevos se agregan desde Estado). */
const TEMAS_FORO_DEMO = [
  {
    titulo: "Dudas sobre la clase tres",
    detalle: "¿Alguien sabe cómo se resuelve el ejercicio de la tercera clase?",
    autor: "Alumno7",
    respuestas: 10,
  },
];

/** Catálogo de la tienda atómica. */
const PRODUCTOS_TIENDA = {
  buffos: [
    { id: "tiempo-15", tipo: "tiempo", titulo: "Multiplicador de tiempo", valor: 1.5, precio: 20 },
    { id: "tiempo-20", tipo: "tiempo", titulo: "Multiplicador de tiempo", valor: 2,   precio: 35 },
    { id: "puntos-15", tipo: "puntos", titulo: "Multiplicador de puntos", valor: 1.5, precio: 30 },
    { id: "puntos-20", tipo: "puntos", titulo: "Multiplicador de puntos", valor: 2,   precio: 45 },
  ],
  skins: [
    { id: "skin-oppenheimer", titulo: "J. Robert Oppenheimer",            precio: 60 },
    { id: "skin-newton",      titulo: "Sir Isaac Newton",                 precio: 60 },
    { id: "skin-curie",       titulo: "María Salomea Skłodowska-Curie",   precio: 60 },
    { id: "skin-white",       titulo: "Walter Hartwell White",            precio: 60 },
  ],
};

/* ============================================================================
   NIVELES DEL CRUCIGRAMA
   ----------------------------------------------------------------------------
   Cada palabra: { numero, palabra, fila, col, dir ("H"|"V"), pista }
   Las coordenadas empiezan en 1 (fila 1, columna 1 = esquina superior izq.).
   Las palabras van SIN tildes para simplificar la escritura en el tablero.
   ========================================================================== */
const NIVELES_CRUCIGRAMA = [
  {
    nivel: 1,
    filas: 9,
    columnas: 9,
    segundos: 600, // 10 minutos
    palabras: [
      { numero: 1, palabra: "HIDROGENO", fila: 1, col: 1, dir: "H",
        pista: "El elemento más ligero y abundante del universo." },
      { numero: 2, palabra: "NITROGENO", fila: 1, col: 8, dir: "V",
        pista: "Gas que compone cerca del 78% del aire que respiramos." },
      { numero: 3, palabra: "OXIDACION", fila: 5, col: 1, dir: "H",
        pista: "Proceso químico en el que un átomo o molécula pierde electrones." },
      { numero: 4, palabra: "OXIGENO", fila: 8, col: 3, dir: "H",
        pista: "Elemento esencial para la respiración celular." },
    ],
  },
  {
    nivel: 2,
    filas: 9,
    columnas: 9,
    segundos: 600,
    palabras: [
      { numero: 1, palabra: "ELECTRON", fila: 3, col: 1, dir: "H",
        pista: "Partícula subatómica con carga negativa." },
      { numero: 2, palabra: "ATOMO", fila: 2, col: 5, dir: "V",
        pista: "La unidad más pequeña de un elemento químico." },
      { numero: 3, palabra: "MOL", fila: 5, col: 5, dir: "H",
        pista: "Unidad que agrupa 6,022 × 10²³ partículas." },
      { numero: 4, palabra: "NEUTRON", fila: 3, col: 8, dir: "V",
        pista: "Partícula del núcleo sin carga eléctrica." },
      { numero: 5, palabra: "PROTON", fila: 8, col: 4, dir: "H",
        pista: "Partícula del núcleo con carga positiva." },
    ],
  },
  {
    nivel: 3,
    filas: 12,
    columnas: 9,
    segundos: 600,
    palabras: [
      { numero: 1, palabra: "REDUCCION", fila: 5, col: 1, dir: "H",
        pista: "Proceso en el que un átomo o molécula gana electrones." },
      { numero: 2, palabra: "CATION", fila: 5, col: 5, dir: "V",
        pista: "Ion con carga positiva." },
      { numero: 3, palabra: "OXIDO", fila: 5, col: 8, dir: "V",
        pista: "Compuesto formado por oxígeno y otro elemento." },
      { numero: 4, palabra: "VALENCIA", fila: 10, col: 1, dir: "H",
        pista: "Capacidad de un átomo para combinarse con otros." },
      { numero: 5, palabra: "ION", fila: 10, col: 7, dir: "V",
        pista: "Átomo o molécula con carga eléctrica." },
    ],
  },
];

/** Puntos otorgados por el juego. */
const PUNTAJE_JUEGO = {
  porPalabra: 5,        // átomos por palabra correcta
  bonoNivel: 10,        // bono por completar el nivel
};
