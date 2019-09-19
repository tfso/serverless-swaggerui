# serverless-swaggerui
A plugin that automatically sets up a /swagger-endpoint that exposes UI and a swagger.json file for the API.  The swagger.json file has to be generated up front, this plugin does not create the swagger.json file, just makes it possible to view it from the api.

## Usage
First run:
```
$ npm --save-dev install @tfso/serverless-swaggerui
```

Then, in the serverless.yml file, add the following:  
```yaml
plugins:
  - "@tfso/serverless-swaggerui"
```
This should be everything.  A file called swagger.json must exist on the root of your serverless project.  
  
Then:
```bash
$ serverless deploy
...
Serverless: Creating swagger-ui artifact at /serverlesspath/.serverless/serverless-swaggerui-plugin.zip
...

$ curl myapi.com/swagger
<html>
...
</html>

$ curl myapi.com/swagger.json
{
    "swagger": "stuff"
}
```

## Config
Right now, no config is necessary.  There are three configs available, described below:  
```yaml
provider:
    enableSwagger: false # Turn off swagger-endpoint, default is true
custom:
    swagger:
        swaggerfile: swagger.json # Set the swaggerfile to include.  Default is swagger.json
        path: swagger # Sets the endpoint in the api.  Defaults to swagger.  The swagger.json will be exposed in the path+.json.  
```

## Bugs?
Use issues in github if you discover a bug.  

## How does it work?
The plugin adds two functions to the api, both with http events.  The code for this is added in a separate zip-file which is uploaded with the other serverless artifacts.  

## Versions
|Version|Date|Description|
|-------|----|-----------|
|0.1.0  | 2019-09-18 | Just a simple plugin to expose a swagger/swagger.json endpoint in the api gateway|
