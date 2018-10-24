# Backend para la app de Ucabture
[![Build Status](https://travis-ci.org/leolas95/ucabture.svg?branch=master)](https://travis-ci.org/leolas95/ucabture)

![Logo](iso.png)

# Primero tener instalado:

* node (v10.12.0)
* npm (v6.4.1)
* git

1. Clonar el repo:

```
git clone https://github.com/leolas95/ucabture
```

2. Ir al directorio donde lo descargaron, y ejecutar:

```
npm install
```

para instalar las dependencias.

3. Para iniciar el servidor:
```
npm start
```

4. Para ejecutar las pruebas:

```
npm test
```

# Estructura de la app

* `db/`: Directorio con los archivos de configuracion de la base de datos
* `routes/`: Directorio con las rutas que maneja el backend
* `schemas/`: Directorio con los esquemas de los modelos de la base de datos
* `tests/`: Directorio con los archivos para realizar las pruebas
* `app.js`: Archivo principal que arranca el servidor

# Endpoints

URL base: https://ucabture.herokuapp.com/

METODO | RUTA | DESCRIPCION | PARAMETROS | RETORNO EXITO | RETORNO ERROR
-------|-------|------------|-----------| ---------------|--------------
GET | /:username/feed | Obtiene el feed de imagenes del usuario :username | username: el nombre del usuario | 200 | 404 si el usuario no existe
POST | /signup | Endpoint para crear un nuevo usuario. | **name**: el nombre real del usuario<br/> **lastname**: el apellido real del usuario<br/> **username**: el nombre de usuario (unico dentro del sistema)<br/> **password**: la clave de acceso del usuario<br/> **email**: correo electronico del usuario<br/> | 201 | 400 si el usuario ya existe
POST | /upload | Sube una nueva imagen al servidor | **description**: La descripcion de la imagen<br/> **emoji**: La calificacion dada a la imagen<br/> **lat**: latitud de donde fue tomada la imagen<br/> **lng**: longitud de donde fue tomada la imagen<br/> **date**: Fecha en que fue tomada la imagen<br/> **username**: nombre de usuario del usuario que sube la imagen<br/> **image**: la imagen propiamente dicha (recordar que debe ser el ultimo parametro) | 201 | 404 si el usuario no existe
POST | /login | Permite iniciar sesion en el sistema | **username**: nombre de usuario<br/> **password**: clave del usuario | 200 | 400 si la clave es incorrecta o el usuario no existe
POST | /admins/login | Permite que un administrador inicie sesion | **username**: El nombre de usuario del administrador<br/> **password**: La clave de acceso del administrador | 200 | 400 si los campos estan vacios, o la clave ingresada es invalida<br/> 404 si el administrador no esta registrado.
POST | /admins/signup | Registrar un nuevo administrador | **name**: nombre real del administrador<br/> **lastname**: apellido<br/> **username**: nombre de usuario del administrador<br/> **password**: la clave de acceso del administrador | 200 | 400 si el username esta ocupado