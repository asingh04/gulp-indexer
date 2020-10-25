const Vinyl = require('vinyl');
const through = require('through2');
const PluginError = require('plugin-error');
const path = require('path');

module.exports = function({
    ext = 'js',
    out =  'index',
    indexEntry,
    removeExtensions = false
} = {}) {

    ext = ext || 'js';
    const outPutFilename = `${out || 'index'}.${ext}`;
    const indexContent = [];
    indexEntry = typeof indexEntry === 'function' ? indexEntry : () => {};

    return through.obj(function(file, enc, callback) {
        if (!file) {
            callback(null, file);
            return;

        }
        if(file.isStream()) {
             callback(new PluginError('Streams are not supported'));
             return;
        }

        let fileName = file.basename.split('.');

        fileName = (fileName.length < 2) ? fileName[0] : fileName.slice(0, -1).join('.'); 
        let filePath = path.relative(file.cwd, file.path);

        if (removeExtensions) {
            filePath = filePath.split('.').slice(0,-1).join('.');
        }
        indexContent.push(indexEntry({ name: fileName, path: filePath }));
        callback();
    },
    function(callback) {
        this.push(new Vinyl({
            path: outPutFilename,
            contents: Buffer.from(indexContent.join('\n'), 'utf8')
        }));

        callback();
    });
};
