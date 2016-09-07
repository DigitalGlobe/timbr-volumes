const exec = require( 'child_process' ).exec;
const koa = require('koa');
const bodyParser = require( 'koa-bodyparser' );

const host = '10.0.0.10';
const port = 8000;
const root = 'juno-pool';

const $exec = cmd =>
  new Promise( ( resolve, reject ) =>
    exec( cmd, ( err, stdout ) => err ? reject( err ) : resolve( stdout ) )
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

const handlers = {
  '/': {
    GET: function list() {
      return $exec( 'sudo zfs list -H -o name,used,available,mountpoint,sharenfs' )
        .then( out => `${out}\n` )
        .then( ...respond( this ) );
    },
    POST: function create() {
      const body = this.request.body;
      return $exec( `sudo zfs create -o quota=${body.size} -o sharenfs=on ${root}/${body.name}` )
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
