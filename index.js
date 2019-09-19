'use strict';

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const indexContent = `

<!DOCTYPE html>
<html>
<link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui.css">

<head>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui-standalone-preset.js"></script>
    <script>
       window.onload = function() {
           const ui = SwaggerUIBundle({
              url: window.location.href+".json",
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
                ],
              layout: "StandaloneLayout"
           })
           window.ui = ui;
       }
    </script>
</head>

<body></body>
</html>
`;

class ServerlessSwaggerUI {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.artifactpath = path.join(this.serverless.config.servicePath,'.serverless','serverless-swaggerui-plugin.zip');
    this.serverless.getProvider('aws');

    this.hooks = {
      'before:package:initialize': this.beforeInit.bind(this),
      'after:package:createDeploymentArtifacts': this.writeArtifact.bind(this)
    };
  }


  setDefaultConfig() {
    if (this.serverless.service.provider.enableSwagger!==false) this.serverless.service.provider.enableSwagger=true;
    if (!this.serverless.service.custom.swagger)
      this.serverless.service.custom.swagger={};
    if (!this.serverless.service.custom.swagger.swaggerfile) 
      this.serverless.service.custom.swagger.swaggerfile="swagger.json";
    if (!this.serverless.service.custom.swagger.path) 
      this.serverless.service.custom.swagger.path="swagger";
  }


  getCode() {
    return `
    const fs = require('fs');
    module.exports.getswaggerjson = async (event, context) => {
        var content = fs.readFileSync('${this.serverless.service.custom.swagger.swaggerfile}');
        return {
          statusCode: 200,
          body: content.toString(),
          headers: {
            "content-type": "application/json"
          }  
        }
    };         

    module.exports.getswaggerhtml = async (event, context) => {
      return {
          statusCode: 200,
          body: \`${indexContent}\`,
          headers: {
            "content-type": "text/html"
          }
      }
    };          
    `

  }

  writeArtifact() {
    if (this.serverless.service.provider.enableSwagger) {
      var archive = archiver('zip');
      var zipfile = fs.createWriteStream(this.artifactpath);
      archive.pipe(zipfile);
      archive.on('error', function(err){
        throw err;
      });
      archive.append(this.getCode(),{name: "serverless-swaggerui-plugin.js"});
      this.serverless.cli.log(`Creating swagger-ui artifact at ${this.artifactpath}`);
      archive.file(path.join(this.serverless.config.servicePath,this.serverless.service.custom.swagger.swaggerfile),{name: this.serverless.service.custom.swagger.swaggerfile})
      archive.finalize();
    }
  }

  beforeInit() {
    this.setDefaultConfig();
    var files = fs.readdirSync(this.serverless.serverlessDirPath);
    if (this.serverless.service.provider.enableSwagger) {
      if (!this.serverless.service.functions.swaggerui) {
        this.serverless.service.functions.swaggeruihtml = {
          handler: "serverless-swaggerui-plugin.getswaggerhtml",
          events: [
          {
            http: {
              path: this.serverless.service.custom.swagger.path,
              method: "get",
              authorizer: null

            }
          }
          ],
          name: `${this.serverless.service.service}-${this.serverless.service.provider.stage}-swaggerhtml`,
          package:  {
            artifact: this.artifactpath
          }

        }

        this.serverless.service.functions.swaggeruijson = {
          handler: "serverless-swaggerui-plugin.getswaggerjson",
          events: [
          {
            http: {
              path: `${this.serverless.service.custom.swagger.path}.json`,
              method: "get",
              authorizer: null

            }
          }
          ],
          name: `${this.serverless.service.service}-${this.serverless.service.provider.stage}-swaggerjson`,
          package:  {
            artifact: this.artifactpath
          }

        }        
      }
    }
  }

}

module.exports = ServerlessSwaggerUI;
