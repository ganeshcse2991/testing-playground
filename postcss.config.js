const tailwindcss = require('tailwindcss');
const atImport = require('postcss-import');

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

const plugins = [atImport, tailwindcss];

if (!IS_DEVELOPMENT) {
  const purgecss = require('@fullhuman/postcss-purgecss');

  class TailwindExtractor {
    static extract(content) {
      return content.match(/[A-z0-9-:/]+/g) || [];
    }
  }

  plugins.push(
    purgecss({
      content: ['src/*.html', 'src/**/*.js'],
      whitelist: ['body', /CodeMirror/],
      whitelistPatternsChildren: [/CodeMirror/, /cm-s-dracula/],
      defaultExtractor: TailwindExtractor.extract,
    }),
  );
}

module.exports = { plugins };
