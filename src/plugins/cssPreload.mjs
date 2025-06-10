import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { glob } from 'glob';

export function cssPreloadPlugin() {
  return {
    name: 'css-preload-plugin',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        try {
          console.log('🔍 Buscando archivos CSS para preload...');
          
          // Buscar archivos CSS generados
          const distPath = dir.pathname;
          const cssFiles = glob.sync('**/style-*.css', { 
            cwd: distPath,
            absolute: false 
          });

          if (cssFiles.length === 0) {
            console.warn('⚠️ No se encontraron archivos CSS para preload');
            return;
          }

          const cssFile = `/${cssFiles[0]}`;
          console.log(`✅ Archivo CSS encontrado: ${cssFile}`);

          // Buscar todos los archivos HTML
          const htmlFiles = glob.sync('**/*.html', { 
            cwd: distPath,
            absolute: true 
          });

          // Inyectar preload en cada archivo HTML
          for (const htmlFile of htmlFiles) {
            let content = readFileSync(htmlFile, 'utf-8');
            
            // Verificar si ya tiene preload para evitar duplicados
            if (content.includes('rel="preload"') && content.includes('style-')) {
              continue;
            }

            // Inyectar preload antes del primer link CSS
            const preloadTag = `  <link rel="preload" as="style" href="${cssFile}" fetchpriority="high" />\n  `;
            
            // Buscar donde insertar el preload (antes del primer link CSS o al final del head)
            if (content.includes('<link rel="stylesheet"')) {
              content = content.replace(
                /(<link rel="stylesheet")/,
                preloadTag + '$1'
              );
            } else {
              content = content.replace(
                /(<\/head>)/,
                preloadTag + '$1'
              );
            }

            writeFileSync(htmlFile, content);
            console.log(`📝 Preload inyectado en: ${htmlFile.replace(distPath, '')}`);
          }

          console.log('✅ Plugin CSS preload completado');
        } catch (error) {
          console.error('❌ Error en plugin CSS preload:', error);
        }
      }
    }
  };
}
