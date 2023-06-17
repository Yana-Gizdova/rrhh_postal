const mysql = require('mysql');
console.log("postal_script.js loaded");

//conexion a la base de datos
const con = mysql.createConnection({
    host: "localhost",
    user: "rrhh",
    password: "rrhh"
});

//array de codigos postales
const array = [
    28000, 28001, 28002, 28003, 28004, 28005, 28006, 28007, 28008, 28009,
    28010, 28011, 28012, 28013, 28014, 28015, 28016, 28017, 28018, 28019,
    28020, 28021, 28022, 28023, 28024, 28025, 28026, 28027, 28028, 28029,
    28030, 28031, 28032, 28033, 28034, 28035, 28036, 28037, 28038, 28039,
    28040, 28041, 28042, 28043, 28044, 28045, 28046, 28047, 28048, 28049,
    28050, 28051, 28052, 28053, 28054, 28055, 28100, 28100, 28108, 28109,
    28110, 28119, 28120, 28130, 28140, 28150, 28160, 28170, 28180, 28189,
    28190, 28191, 28192, 28193, 28194, 28195, 28196, 28200, 28200, 28209,
    28210, 28211, 28212, 28213, 28214, 28219, 28220, 28221, 28222, 28223,
    28224, 28229, 28231, 28232, 28240, 28248, 28250, 28260, 28270, 28280,
    28290, 28292, 28293, 28294, 28295, 28296, 28297, 28300, 28300, 28310,
    28311, 28312, 28320, 28330, 28341, 28342, 28343, 28350, 28359, 28360,
    28370, 28380, 28390, 28391, 28400, 28400, 28410, 28411, 28412, 28413,
    28420, 28430, 28440, 28450, 28459, 28460, 28470, 28479, 28480, 28490,
    28491, 28492, 28500, 28500, 28510, 28511, 28512, 28513, 28514, 28515,
    28521, 28522, 28523, 28524, 28529, 28530, 28540, 28550, 28560, 28570,
    28580, 28590, 28594, 28595, 28596, 28597, 28598, 28600, 28600, 28607,
    28609, 28610, 28620, 28630, 28640, 28648, 28649, 28650, 28660, 28670,
    28679, 28680, 28690, 28691, 28692, 28693, 28694, 28695, 28696, 28700,
    28701, 28702, 28703, 28706, 28707, 28708, 28709, 28710, 28720, 28721,
    28722, 28723, 28729, 28730, 28737, 28739, 28740, 28741, 28742, 28743,
    28749, 28750, 28751, 28752, 28753, 28754, 28755, 28756, 28760, 28770,
    28780, 28790, 28791, 28792, 28793, 28794, 28800, 28801, 28802, 28803,
    28804, 28805, 28806, 28807, 28810, 28811, 28812, 28813, 28814, 28815,
    28816, 28817, 28818, 28821, 28822, 28823, 28830, 28840, 28850, 28860,
    28861, 28862, 28863, 28864, 28880, 28890, 28891, 28900, 28901, 28902,
    28903, 28904, 28905, 28906, 28907, 28909, 28911, 28912, 28913, 28914,
    28915, 28916, 28917, 28918, 28919, 28921, 28922, 28923, 28924, 28925,
    28931, 28932, 28933, 28934, 28935, 28936, 28937, 28938, 28939, 28940,
    28941, 28942, 28943, 28944, 28945, 28946, 28947, 28950, 28970, 28971,
    28976, 28977, 28978, 28979, 28981, 28982, 28983, 28984, 28990, 28991
];
 
const objeto = {}; //es un json
async function asincrona() {
    for (const element of array) {
        //fetch devuelve promesa: fullfilled o rejected, etc
        //await espera a que se resuelva la promesa
        //then se ejecuta cuando se resuelve la promesa al final de la promesa, ejecuta la funcion que le pasamos = fetch pero con distinta sintaxis
        const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${element}&country=Spain&format=json`);
        const resJson = await(respuesta.json());
        //operador ? para evitar que se rompa el programa si no encuentra el codigo postal = null check o undefined check
        const lat = resJson?.[0]?.lat;
        const lon = resJson?.[0]?.lon;
        //en los objetos, clave = codigo postal, valor = latitud y longitud
        // tambien funciona if (lat && lon) son falsy vaules: undefined, null, 0, false, NaN, ''
        if (lat === undefined || lon === undefined) {
            console.log(`No se ha encontrado el código postal ${element}`);
        }
        else {
            objeto[element] = {lat, lon};
            console.log(objeto);
            return Promise.resolve("");
        }
    }
    //devuelve una promesa vacia
    return Promise.resolve("");
}

//callback: function es como lambda en python, podría declarar la función fuera y pasarla como parámetro
//arrow function: () => {} es lo mismo que function() {}
//err es el parametro de la funcion que se declara
function insertarBD () {
    con.connect(err => {
        if (err) throw err;
        console.log("Connected!");
        for (const [key, value] of Object.entries(objeto)) {
            //const lat = element.lat;
            //const lon = element.lon;
            //descomponer un objeto en sus claves por nombre, si no coincide el nombre se pone nueva:original -> latitud:lat
            //se puede hacer con arrays tambien
            const {lat, lon} = value;
            const sql = `INSERT INTO rrhh.codigos_postales (codigo_postal, latitud, longitud) VALUES (${key}, ${lat}, ${lon})`;
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
            });
        } 
    });
}

//funcion como distancia que está en java pero en javascript
function distancia(lat1, lon1, lat2, lon2) {
    if (lat1 === lat2 && lon1 === lon2) {
        return 0;
    }
    const radioTierra = 6371;
    const distanciaLatitud = Math.toRadians(lat2 - lat1);
    const distanciaLongitud = Math.toRadians(lon2 - lon1);
    const senoDLatitud = Math.sin(distanciaLatitud / 2);
    const senoDLongitud = Math.sin(distanciaLongitud / 2);
    const expresion1 = Math.pow(senoDLatitud, 2)
            + Math.pow(senoDLongitud, 2) * Math.cos(Math.toRadians(lat1))
                    * Math.cos(Math.toRadians(lat2));
    const expresion2 = 2 * Math.atan2(Math.sqrt(expresion1), Math.sqrt(1 - expresion1));
    const distancia = radioTierra * expresion2; // en km
    return distancia;
}
//funcion para itere el json objeto calculando distancias cartesianas entre cada codigo postal que use la funcion distancia
function calcularDistancias() {
    for (const [key, value] of Object.entries(objeto)) {
        const {lat, lon} = value;
        for (const [key2, value2] of Object.entries(objeto)) {
            const {lat: lat2, lon: lon2} = value2;
            const distancia = distancia(lat, lon, lat2, lon2);
            console.log(`La distancia entre ${key} y ${key2} es ${distancia}`);
            //if key 1 < key 2 -> insertar en la tabla distancias que tiene origen key y destino key2 y distancia
            const sql = `INSERT INTO rrhh.distancias (origen, destino, distancia) VALUES (${key}, ${key2}, ${distancia})`;
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
            } );
        }
    }
}

asincrona().then(() => {
    console.log(objeto); 
    insertarBD();
    calcularDistancias();
});
