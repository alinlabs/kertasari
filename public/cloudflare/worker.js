/**
 * Welcome to Cloudflare Workers! This is your worker for KPPM Kertasari.
 * Endpoint: https://app.kppm-kertasari.workers.dev/
 * 
 * To deploy:
 * - wrangler d1 create db_kppm
 * - wrangler d1 execute db_kppm --file=./schema.sql
 * - wrangler d1 execute db_kppm --file=./seed-administrasi.sql
 * - wrangler d1 execute db_kppm --file=./seed-agenda.sql
 * - wrangler d1 execute db_kppm --file=./seed-keanggotaan.sql
 * - wrangler d1 execute db_kppm --file=./seed-kehadiran.sql
 * - wrangler d1 execute db_kppm --file=./seed-keuangan.sql
 * - wrangler d1 execute db_kppm --file=./seed-proker.sql
 * - wrangler d1 execute db_kppm --file=./seed-seputar.sql
 * - wrangler deploy
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Utilities untuk handling tipe data dari/ke React app (camelCase <-> snake_case)
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean); // e.g. ['api', 'agenda', '1']
    const db = env.db_kppm; // Expected D1 binding: db_kppm

    try {
      if (!db) {
        throw new Error('Database binding (db_kppm) is not available');
      }

      if (pathParts[0] === 'api' && pathParts[1]) {
        const table = pathParts[1];
        const validTables = ['administrasi', 'agenda', 'keanggotaan', 'kehadiran', 'keuangan', 'proker', 'seputar'];
        
        if (!validTables.includes(table)) {
           return new Response(JSON.stringify({ error: "Table endpoint not found" }), {
             status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
           });
        }

        // Support get id parameters from route `/api/agenda/1` or query `/api/agenda?id=1`
        const id = pathParts[2] || url.searchParams.get('id');

        // --- MENGAMBIL DATA (GET) ---
        if (request.method === 'GET') {
          if (id) {
            const { results } = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).all();
            if (!results[0]) {
               return new Response(JSON.stringify({error: "Data not found"}), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
            }
            
            // Format data
            let parsedRow = {};
            for (let key in results[0]) {
              let value = results[0][key];
              if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                try { value = JSON.parse(value); } catch (e) { /* ignore non-json */ }
              }
              parsedRow[toCamelCase(key)] = value;
            }

            return new Response(JSON.stringify(parsedRow), { 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            });
          } else {
            let query = `SELECT * FROM ${table}`;
            if (table === 'agenda') query += ' ORDER BY tanggal ASC, waktu ASC';
            if (table === 'keuangan') query += ' ORDER BY tanggal ASC';
            const { results } = await db.prepare(query).all();
            
            // Map keys ke format React camelCase & re-parse JSON Object/Array string dari D1
            const parsedResults = results.map(row => {
              let parsedRow = {};
              for (let key in row) {
                let value = row[key];
                if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                  try { value = JSON.parse(value); } catch (e) { /* ignore non-json */ }
                }
                parsedRow[toCamelCase(key)] = value;
              }
              return parsedRow;
            });
            return new Response(JSON.stringify(parsedResults), { 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            });
          }
        }

        // --- MEMBUAT DATA BARU (POST) ---
        if (request.method === 'POST') {
          const data = await request.json();
          if (!data.id) {
            data.id = crypto.randomUUID(); // Auto generate ID
          }

          const { results: tableInfos } = await db.prepare(`PRAGMA table_info(${table})`).all();
          const validColumns = tableInfos.map(col => col.name);

          const dbData = {};
          // Konversi dari React object (termasuk complex JSON array/object) ke string form D1 (dan snake_case)
          for (let key in data) {
             const snakeKey = toSnakeCase(key);
             if (!validColumns.includes(snakeKey)) continue;

             let value = data[key];
             if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
             }
             dbData[snakeKey] = value;
          }

          const keys = Object.keys(dbData);
          const values = Object.values(dbData);
          const placeholders = keys.map(() => '?').join(', ');
          
          const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
          await db.prepare(query).bind(...values).run();
          
          return new Response(JSON.stringify({ success: true, id: data.id, message: 'Created successfully' }), { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 201
          });
        }

        // --- MEMPERBARUI DATA (PUT) ---
        if (request.method === 'PUT') {
          if (!id) return new Response(JSON.stringify({ error: "ID is required for UPDATE" }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          const data = await request.json();
          
          const { results: tableInfos } = await db.prepare(`PRAGMA table_info(${table})`).all();
          const validColumns = tableInfos.map(col => col.name);

          const dbData = {};
          for (let key in data) {
             const snakeKey = toSnakeCase(key);
             if (snakeKey === 'id') continue; // Prevent overwriting ID
             if (!validColumns.includes(snakeKey)) continue;

             let value = data[key];
             if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
             }
             dbData[snakeKey] = value;
          }

          const keys = Object.keys(dbData);
          if (keys.length === 0) {
             return new Response(JSON.stringify({ error: "No fields to update" }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
          }

          const values = Object.values(dbData);
          const setClauses = keys.map(k => `${k} = ?`).join(', ');

          const query = `UPDATE ${table} SET ${setClauses} WHERE id = ?`;
          await db.prepare(query).bind(...values, id).run();

          return new Response(JSON.stringify({ success: true, message: 'Updated successfully' }), { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          });
        }

        // --- MENGHAPUS DATA (DELETE) ---
        if (request.method === 'DELETE') {
           if (!id) return new Response(JSON.stringify({ error: "ID is required for DELETE" }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
           await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
           
           return new Response(JSON.stringify({ success: true, message: 'Deleted successfully' }), { 
             headers: { 'Content-Type': 'application/json', ...corsHeaders } 
           });
        }
      }

      // Default response jika route tidak matches API Table valid
      const tables = ['administrasi', 'agenda', 'keanggotaan', 'kehadiran', 'keuangan', 'proker', 'seputar'];
      const apiInfo = {
        name: "KPPM Kertasari API",
        version: "1.0.0",
        description: "API Manajemen Data KPPM Desa Kertasari",
        status: "Online",
        timestamp: new Date().toISOString(),
        available_endpoints: tables.map(t => ({
             path: `/api/${t}`,
             methods: ['GET', 'POST', 'PUT', 'DELETE'],
             description: `Endpoint CRUD untuk entitas ${t}`
        })),
        database_binding: "db_kppm"
      };

      return new Response(JSON.stringify(apiInfo, null, 2), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
      
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
  },
};
