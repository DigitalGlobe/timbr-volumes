const exec = require( 'child_process' ).exec;
const koa = require('koa');
const bodyParser = require( 'koa-bodyparser' );

const host = '10.0.0.10';
const port = 8000;
const root = 'juno-pool';

const $exec = cmd =>
  new Promise( ( resolve, reject ) =>
    exec( cmd, ( err, stdout ) => err ? reject( err ) : resolve( stdout.trim() ) )
  )

const respond = ctx => [
  data => {
    ctx.body = data;
    ctx.status = 200;
  },
  err => {
    console.log( err );
    ctx.status = 500;
  }
];

const zip = fields =>
  ( memo, item, index ) => Object.assign( memo, { [fields[index]]: item } )

const handlers = {
  '/': {
    GET: function list() {
      const fields = [ 'name', 'used', 'available', 'mountpoint', 'sharenfs' ];
      return $exec( `sudo zfs list -H -o ${fields.join( ',' )}` )
        .then( out => out.split( '\n' ).map( line => line.split( /\s/ ).reduce( zip( fields ), {} ) ) )
        .then( ...respond( this ) );
    },
    POST: function create() {
      const body = this.request.body;
      return $exec( `sudo zfs clone -o quota=${body.size} -o sharenfs=on <snapshot> ${root}/${body.name}` )
        .then( ...respond( this ) );
    },
    DELETE: function destroy() {
      const body = this.request.body;
      return $exec( `sudo zfs destroy ${root}/${body.name}` )
        .then( ...respond( this ) );
    }
  }
};

const app = koa();

app
  .use( bodyParser() )
  .use(function *() {
    const handler = ( handlers[this.url] || {} )[this.method];
    if ( handler ) yield handler.call( this );
  })
  .listen( port, host, () => console.log( `Listening on ${host}:${port}` ) );
