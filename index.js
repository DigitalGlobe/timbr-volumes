const exec = require( 'child_process' ).exec;
const koa = require('koa');

const host = '10.0.0.10';
const port = 8000;

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

const app = koa();

const handlers = {
  '/': {
    GET: function* list() {
      yield $exec( 'sudo zfs list -H -o name,used,available,mountpoint,sharenfs' )
        .then( ...respond( this ) );
    },
    POST: function* create() {
      yield $exec( `sudo zfs create -o quota=${this.size} -o sharenfs=on juno-pool/${this.name}` )
        .then( ...respond( this ) );
    }
  }
};

app.use(function *() {
  const handler = ( handlers[this.url] || {} )[this.method];
  if ( handler ) handler.call( this );
});

app.listen( port, host, () => console.log( `Listening on ${host}:${port}` ) );
