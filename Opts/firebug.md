react-dom.development.js:29895 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
api.ts:62   GET http://127.0.0.1:8000/v1/tickets/ 404 (Not Found)
simpleFetch @ api.ts:62
(anonymous) @ api.ts:100
processRequest @ requestQueue.ts:63
(anonymous) @ requestQueue.ts:42
processQueue @ requestQueue.ts:42
(anonymous) @ requestQueue.ts:29
add @ requestQueue.ts:18
fetchJson @ api.ts:100
getTickets @ api.ts:837
fetchTickets @ Support.tsx:53
(anonymous) @ Support.tsx:47
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:839  Error fetching tickets: Error: <!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <title>Page not found at /v1/tickets/</title>
  <meta name="robots" content="NONE,NOARCHIVE">
  <style>
    html * { padding:0; margin:0; }
    body * { padding:10px 20px; }
    body * * { padding:0; }
    body { font-family: sans-serif; background:#eee; color:#000; }
    body > :where(header, main, footer) { border-bottom:1px solid #ddd; }
    h1 { font-weight:normal; margin-bottom:.4em; }
    h1 small { font-size:60%; color:#666; font-weight:normal; }
    table { border:none; border-collapse: collapse; width:100%; }
    td, th { vertical-align:top; padding:2px 3px; }
    th { width:12em; text-align:right; color:#666; padding-right:.5em; }
    #info { background:#f6f6f6; }
    #info ol { margin: 0.5em 4em; }
    #info ol li { font-family: monospace; }
    #summary { background: #ffc; }
    #explanation { background:#eee; border-bottom: 0px none; }
    pre.exception_value { font-family: sans-serif; color: #575757; font-size: 1.5em; margin: 10px 0 10px 0; }
  </style>
</head>
<body>
  <header id="summary">
    <h1>Page not found <small>(404)</small></h1>
    
    <table class="meta">
      <tr>
        <th scope="row">Request Method:</th>
        <td>GET</td>
      </tr>
      <tr>
        <th scope="row">Request URL:</th>
        <td>http://127.0.0.1:8000/v1/tickets/</td>
      </tr>
      
    </table>
  </header>

  <main id="info">
    
      <p>
      Using the URLconf defined in <code>config.urls</code>,
      Django tried these URL patterns, in this order:
      </p>
      <ol>
        
          <li>
            
              <code>
                
                [name='home']
              </code>
            
          </li>
        
          <li>
            
              <code>
                favicon.ico
                [name='favicon']
              </code>
            
          </li>
        
          <li>
            
              <code>
                admin/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/schema/
                [name='schema']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/docs/
                [name='swagger-ui']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/
                [name='token_obtain_pair']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/refresh/
                [name='token_refresh']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                ^media/(?P&lt;path&gt;.*)$
                
              </code>
            
          </li>
        
      </ol>
      <p>
        
          The current path, <code>v1/tickets/</code>,
        
        didn’t match any of these.
      </p>
    
  </main>

  <footer id="explanation">
    <p>
      You’re seeing this error because you have <code>DEBUG = True</code> in
      your Django settings file. Change that to <code>False</code>, and Django
      will display a standard 404 page.
    </p>
  </footer>
</body>
</html>

    at simpleFetch (api.ts:92:11)
    at async RequestQueue.processRequest (requestQueue.ts:63:22)
    at async Promise.allSettled (index 0)
    at async RequestQueue.processQueue (requestQueue.ts:41:7)
getTickets @ api.ts:839
await in getTickets
fetchTickets @ Support.tsx:53
(anonymous) @ Support.tsx:47
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
Support.tsx:56  Error fetching tickets: Error: <!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <title>Page not found at /v1/tickets/</title>
  <meta name="robots" content="NONE,NOARCHIVE">
  <style>
    html * { padding:0; margin:0; }
    body * { padding:10px 20px; }
    body * * { padding:0; }
    body { font-family: sans-serif; background:#eee; color:#000; }
    body > :where(header, main, footer) { border-bottom:1px solid #ddd; }
    h1 { font-weight:normal; margin-bottom:.4em; }
    h1 small { font-size:60%; color:#666; font-weight:normal; }
    table { border:none; border-collapse: collapse; width:100%; }
    td, th { vertical-align:top; padding:2px 3px; }
    th { width:12em; text-align:right; color:#666; padding-right:.5em; }
    #info { background:#f6f6f6; }
    #info ol { margin: 0.5em 4em; }
    #info ol li { font-family: monospace; }
    #summary { background: #ffc; }
    #explanation { background:#eee; border-bottom: 0px none; }
    pre.exception_value { font-family: sans-serif; color: #575757; font-size: 1.5em; margin: 10px 0 10px 0; }
  </style>
</head>
<body>
  <header id="summary">
    <h1>Page not found <small>(404)</small></h1>
    
    <table class="meta">
      <tr>
        <th scope="row">Request Method:</th>
        <td>GET</td>
      </tr>
      <tr>
        <th scope="row">Request URL:</th>
        <td>http://127.0.0.1:8000/v1/tickets/</td>
      </tr>
      
    </table>
  </header>

  <main id="info">
    
      <p>
      Using the URLconf defined in <code>config.urls</code>,
      Django tried these URL patterns, in this order:
      </p>
      <ol>
        
          <li>
            
              <code>
                
                [name='home']
              </code>
            
          </li>
        
          <li>
            
              <code>
                favicon.ico
                [name='favicon']
              </code>
            
          </li>
        
          <li>
            
              <code>
                admin/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/schema/
                [name='schema']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/docs/
                [name='swagger-ui']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/
                [name='token_obtain_pair']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/refresh/
                [name='token_refresh']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                ^media/(?P&lt;path&gt;.*)$
                
              </code>
            
          </li>
        
      </ol>
      <p>
        
          The current path, <code>v1/tickets/</code>,
        
        didn’t match any of these.
      </p>
    
  </main>

  <footer id="explanation">
    <p>
      You’re seeing this error because you have <code>DEBUG = True</code> in
      your Django settings file. Change that to <code>False</code>, and Django
      will display a standard 404 page.
    </p>
  </footer>
</body>
</html>

    at simpleFetch (api.ts:92:11)
    at async RequestQueue.processRequest (requestQueue.ts:63:22)
    at async Promise.allSettled (index 0)
    at async RequestQueue.processQueue (requestQueue.ts:41:7)
fetchTickets @ Support.tsx:56
await in fetchTickets
(anonymous) @ Support.tsx:47
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:62   GET http://127.0.0.1:8000/v1/auth/me/ 404 (Not Found)
simpleFetch @ api.ts:62
(anonymous) @ api.ts:100
processRequest @ requestQueue.ts:63
(anonymous) @ requestQueue.ts:42
processQueue @ requestQueue.ts:42
await in processQueue
(anonymous) @ requestQueue.ts:29
add @ requestQueue.ts:18
fetchJson @ api.ts:100
getTickets @ api.ts:837
fetchTickets @ Support.tsx:53
(anonymous) @ Support.tsx:47
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:62   GET http://127.0.0.1:8000/v1/orders/user/ 404 (Not Found)
simpleFetch @ api.ts:62
(anonymous) @ api.ts:100
processRequest @ requestQueue.ts:63
(anonymous) @ requestQueue.ts:42
processQueue @ requestQueue.ts:42
await in processQueue
(anonymous) @ requestQueue.ts:29
add @ requestQueue.ts:18
fetchJson @ api.ts:100
getTickets @ api.ts:837
fetchTickets @ Support.tsx:53
(anonymous) @ Support.tsx:47
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:374  Error fetching orders: Error: <!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <title>Page not found at /v1/orders/user/</title>
  <meta name="robots" content="NONE,NOARCHIVE">
  <style>
    html * { padding:0; margin:0; }
    body * { padding:10px 20px; }
    body * * { padding:0; }
    body { font-family: sans-serif; background:#eee; color:#000; }
    body > :where(header, main, footer) { border-bottom:1px solid #ddd; }
    h1 { font-weight:normal; margin-bottom:.4em; }
    h1 small { font-size:60%; color:#666; font-weight:normal; }
    table { border:none; border-collapse: collapse; width:100%; }
    td, th { vertical-align:top; padding:2px 3px; }
    th { width:12em; text-align:right; color:#666; padding-right:.5em; }
    #info { background:#f6f6f6; }
    #info ol { margin: 0.5em 4em; }
    #info ol li { font-family: monospace; }
    #summary { background: #ffc; }
    #explanation { background:#eee; border-bottom: 0px none; }
    pre.exception_value { font-family: sans-serif; color: #575757; font-size: 1.5em; margin: 10px 0 10px 0; }
  </style>
</head>
<body>
  <header id="summary">
    <h1>Page not found <small>(404)</small></h1>
    
    <table class="meta">
      <tr>
        <th scope="row">Request Method:</th>
        <td>GET</td>
      </tr>
      <tr>
        <th scope="row">Request URL:</th>
        <td>http://127.0.0.1:8000/v1/orders/user/</td>
      </tr>
      
    </table>
  </header>

  <main id="info">
    
      <p>
      Using the URLconf defined in <code>config.urls</code>,
      Django tried these URL patterns, in this order:
      </p>
      <ol>
        
          <li>
            
              <code>
                
                [name='home']
              </code>
            
          </li>
        
          <li>
            
              <code>
                favicon.ico
                [name='favicon']
              </code>
            
          </li>
        
          <li>
            
              <code>
                admin/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/schema/
                [name='schema']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/docs/
                [name='swagger-ui']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/
                [name='token_obtain_pair']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/refresh/
                [name='token_refresh']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                ^media/(?P&lt;path&gt;.*)$
                
              </code>
            
          </li>
        
      </ol>
      <p>
        
          The current path, <code>v1/orders/user/</code>,
        
        didn’t match any of these.
      </p>
    
  </main>

  <footer id="explanation">
    <p>
      You’re seeing this error because you have <code>DEBUG = True</code> in
      your Django settings file. Change that to <code>False</code>, and Django
      will display a standard 404 page.
    </p>
  </footer>
</body>
</html>

    at simpleFetch (api.ts:92:11)
    at async RequestQueue.processRequest (requestQueue.ts:63:22)
    at async Promise.allSettled (index 1)
    at async RequestQueue.processQueue (requestQueue.ts:41:7)
getUserOrders @ api.ts:374
await in getUserOrders
fetchFn @ query.ts:429
run @ retryer.ts:153
start @ retryer.ts:218
fetch @ query.ts:540
executeFetch_fn @ queryObserver.ts:346
onSubscribe @ queryObserver.ts:108
subscribe @ subscribable.ts:11
(anonymous) @ useBaseQuery.ts:92
subscribeToStore @ react-dom.development.js:16139
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:62   GET http://127.0.0.1:8000/v1/cart-items/ 404 (Not Found)
simpleFetch @ api.ts:62
(anonymous) @ api.ts:100
processRequest @ requestQueue.ts:63
(anonymous) @ requestQueue.ts:42
processQueue @ requestQueue.ts:42
await in processQueue
(anonymous) @ requestQueue.ts:29
add @ requestQueue.ts:18
fetchJson @ api.ts:100
getTickets @ api.ts:837
fetchTickets @ Support.tsx:53
(anonymous) @ Support.tsx:47
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:62   GET http://127.0.0.1:8000/v1/carts/ 404 (Not Found)
simpleFetch @ api.ts:62
(anonymous) @ api.ts:100
processRequest @ requestQueue.ts:63
(anonymous) @ requestQueue.ts:42
processQueue @ requestQueue.ts:42
await in processQueue
(anonymous) @ requestQueue.ts:29
add @ requestQueue.ts:18
fetchJson @ api.ts:100
getTickets @ api.ts:837
fetchTickets @ Support.tsx:53
(anonymous) @ Support.tsx:47
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:392  Error fetching cart items: Error: <!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <title>Page not found at /v1/cart-items/</title>
  <meta name="robots" content="NONE,NOARCHIVE">
  <style>
    html * { padding:0; margin:0; }
    body * { padding:10px 20px; }
    body * * { padding:0; }
    body { font-family: sans-serif; background:#eee; color:#000; }
    body > :where(header, main, footer) { border-bottom:1px solid #ddd; }
    h1 { font-weight:normal; margin-bottom:.4em; }
    h1 small { font-size:60%; color:#666; font-weight:normal; }
    table { border:none; border-collapse: collapse; width:100%; }
    td, th { vertical-align:top; padding:2px 3px; }
    th { width:12em; text-align:right; color:#666; padding-right:.5em; }
    #info { background:#f6f6f6; }
    #info ol { margin: 0.5em 4em; }
    #info ol li { font-family: monospace; }
    #summary { background: #ffc; }
    #explanation { background:#eee; border-bottom: 0px none; }
    pre.exception_value { font-family: sans-serif; color: #575757; font-size: 1.5em; margin: 10px 0 10px 0; }
  </style>
</head>
<body>
  <header id="summary">
    <h1>Page not found <small>(404)</small></h1>
    
    <table class="meta">
      <tr>
        <th scope="row">Request Method:</th>
        <td>GET</td>
      </tr>
      <tr>
        <th scope="row">Request URL:</th>
        <td>http://127.0.0.1:8000/v1/cart-items/</td>
      </tr>
      
    </table>
  </header>

  <main id="info">
    
      <p>
      Using the URLconf defined in <code>config.urls</code>,
      Django tried these URL patterns, in this order:
      </p>
      <ol>
        
          <li>
            
              <code>
                
                [name='home']
              </code>
            
          </li>
        
          <li>
            
              <code>
                favicon.ico
                [name='favicon']
              </code>
            
          </li>
        
          <li>
            
              <code>
                admin/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/schema/
                [name='schema']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/docs/
                [name='swagger-ui']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/
                [name='token_obtain_pair']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/refresh/
                [name='token_refresh']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                ^media/(?P&lt;path&gt;.*)$
                
              </code>
            
          </li>
        
      </ol>
      <p>
        
          The current path, <code>v1/cart-items/</code>,
        
        didn’t match any of these.
      </p>
    
  </main>

  <footer id="explanation">
    <p>
      You’re seeing this error because you have <code>DEBUG = True</code> in
      your Django settings file. Change that to <code>False</code>, and Django
      will display a standard 404 page.
    </p>
  </footer>
</body>
</html>

    at simpleFetch (api.ts:92:11)
    at async RequestQueue.processRequest (requestQueue.ts:63:22)
    at async Promise.allSettled (index 1)
    at async RequestQueue.processQueue (requestQueue.ts:41:7)
getUserCartItems @ api.ts:392
await in getUserCartItems
fetchFn @ query.ts:429
run @ retryer.ts:153
start @ retryer.ts:218
fetch @ query.ts:540
executeFetch_fn @ queryObserver.ts:346
onSubscribe @ queryObserver.ts:108
subscribe @ subscribable.ts:11
(anonymous) @ useBaseQuery.ts:92
subscribeToStore @ react-dom.development.js:16139
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:383  Error fetching cart: Error: <!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <title>Page not found at /v1/carts/</title>
  <meta name="robots" content="NONE,NOARCHIVE">
  <style>
    html * { padding:0; margin:0; }
    body * { padding:10px 20px; }
    body * * { padding:0; }
    body { font-family: sans-serif; background:#eee; color:#000; }
    body > :where(header, main, footer) { border-bottom:1px solid #ddd; }
    h1 { font-weight:normal; margin-bottom:.4em; }
    h1 small { font-size:60%; color:#666; font-weight:normal; }
    table { border:none; border-collapse: collapse; width:100%; }
    td, th { vertical-align:top; padding:2px 3px; }
    th { width:12em; text-align:right; color:#666; padding-right:.5em; }
    #info { background:#f6f6f6; }
    #info ol { margin: 0.5em 4em; }
    #info ol li { font-family: monospace; }
    #summary { background: #ffc; }
    #explanation { background:#eee; border-bottom: 0px none; }
    pre.exception_value { font-family: sans-serif; color: #575757; font-size: 1.5em; margin: 10px 0 10px 0; }
  </style>
</head>
<body>
  <header id="summary">
    <h1>Page not found <small>(404)</small></h1>
    
    <table class="meta">
      <tr>
        <th scope="row">Request Method:</th>
        <td>GET</td>
      </tr>
      <tr>
        <th scope="row">Request URL:</th>
        <td>http://127.0.0.1:8000/v1/carts/</td>
      </tr>
      
    </table>
  </header>

  <main id="info">
    
      <p>
      Using the URLconf defined in <code>config.urls</code>,
      Django tried these URL patterns, in this order:
      </p>
      <ol>
        
          <li>
            
              <code>
                
                [name='home']
              </code>
            
          </li>
        
          <li>
            
              <code>
                favicon.ico
                [name='favicon']
              </code>
            
          </li>
        
          <li>
            
              <code>
                admin/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/schema/
                [name='schema']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/docs/
                [name='swagger-ui']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/
                [name='token_obtain_pair']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/refresh/
                [name='token_refresh']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                ^media/(?P&lt;path&gt;.*)$
                
              </code>
            
          </li>
        
      </ol>
      <p>
        
          The current path, <code>v1/carts/</code>,
        
        didn’t match any of these.
      </p>
    
  </main>

  <footer id="explanation">
    <p>
      You’re seeing this error because you have <code>DEBUG = True</code> in
      your Django settings file. Change that to <code>False</code>, and Django
      will display a standard 404 page.
    </p>
  </footer>
</body>
</html>

    at simpleFetch (api.ts:92:11)
    at async RequestQueue.processRequest (requestQueue.ts:63:22)
    at async Promise.allSettled (index 0)
    at async RequestQueue.processQueue (requestQueue.ts:41:7)
getUserCart @ api.ts:383
await in getUserCart
fetchFn @ query.ts:429
run @ retryer.ts:153
start @ retryer.ts:218
fetch @ query.ts:540
executeFetch_fn @ queryObserver.ts:346
onSubscribe @ queryObserver.ts:108
subscribe @ subscribable.ts:11
(anonymous) @ useBaseQuery.ts:92
subscribeToStore @ react-dom.development.js:16139
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:62   GET http://127.0.0.1:8000/v1/notifications/ 404 (Not Found)
simpleFetch @ api.ts:62
(anonymous) @ api.ts:100
processRequest @ requestQueue.ts:63
(anonymous) @ requestQueue.ts:42
processQueue @ requestQueue.ts:42
await in processQueue
(anonymous) @ requestQueue.ts:29
add @ requestQueue.ts:18
fetchJson @ api.ts:100
getTickets @ api.ts:837
fetchTickets @ Support.tsx:53
(anonymous) @ Support.tsx:47
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:613  Error fetching notifications: Error: <!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <title>Page not found at /v1/notifications/</title>
  <meta name="robots" content="NONE,NOARCHIVE">
  <style>
    html * { padding:0; margin:0; }
    body * { padding:10px 20px; }
    body * * { padding:0; }
    body { font-family: sans-serif; background:#eee; color:#000; }
    body > :where(header, main, footer) { border-bottom:1px solid #ddd; }
    h1 { font-weight:normal; margin-bottom:.4em; }
    h1 small { font-size:60%; color:#666; font-weight:normal; }
    table { border:none; border-collapse: collapse; width:100%; }
    td, th { vertical-align:top; padding:2px 3px; }
    th { width:12em; text-align:right; color:#666; padding-right:.5em; }
    #info { background:#f6f6f6; }
    #info ol { margin: 0.5em 4em; }
    #info ol li { font-family: monospace; }
    #summary { background: #ffc; }
    #explanation { background:#eee; border-bottom: 0px none; }
    pre.exception_value { font-family: sans-serif; color: #575757; font-size: 1.5em; margin: 10px 0 10px 0; }
  </style>
</head>
<body>
  <header id="summary">
    <h1>Page not found <small>(404)</small></h1>
    
    <table class="meta">
      <tr>
        <th scope="row">Request Method:</th>
        <td>GET</td>
      </tr>
      <tr>
        <th scope="row">Request URL:</th>
        <td>http://127.0.0.1:8000/v1/notifications/</td>
      </tr>
      
    </table>
  </header>

  <main id="info">
    
      <p>
      Using the URLconf defined in <code>config.urls</code>,
      Django tried these URL patterns, in this order:
      </p>
      <ol>
        
          <li>
            
              <code>
                
                [name='home']
              </code>
            
          </li>
        
          <li>
            
              <code>
                favicon.ico
                [name='favicon']
              </code>
            
          </li>
        
          <li>
            
              <code>
                admin/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/schema/
                [name='schema']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/docs/
                [name='swagger-ui']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/
                [name='token_obtain_pair']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/refresh/
                [name='token_refresh']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                ^media/(?P&lt;path&gt;.*)$
                
              </code>
            
          </li>
        
      </ol>
      <p>
        
          The current path, <code>v1/notifications/</code>,
        
        didn’t match any of these.
      </p>
    
  </main>

  <footer id="explanation">
    <p>
      You’re seeing this error because you have <code>DEBUG = True</code> in
      your Django settings file. Change that to <code>False</code>, and Django
      will display a standard 404 page.
    </p>
  </footer>
</body>
</html>

    at simpleFetch (api.ts:92:11)
    at async RequestQueue.processRequest (requestQueue.ts:63:22)
    at async Promise.allSettled (index 0)
    at async RequestQueue.processQueue (requestQueue.ts:41:7)
getUserNotifications @ api.ts:613
await in getUserNotifications
fetchFn @ query.ts:429
run @ retryer.ts:153
start @ retryer.ts:218
fetch @ query.ts:540
executeFetch_fn @ queryObserver.ts:346
onSubscribe @ queryObserver.ts:108
subscribe @ subscribable.ts:11
(anonymous) @ useBaseQuery.ts:92
subscribeToStore @ react-dom.development.js:16139
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:62   GET http://127.0.0.1:8000/v1/tickets/ 404 (Not Found)
simpleFetch @ api.ts:62
(anonymous) @ api.ts:100
processRequest @ requestQueue.ts:63
(anonymous) @ requestQueue.ts:42
processQueue @ requestQueue.ts:42
(anonymous) @ requestQueue.ts:29
add @ requestQueue.ts:18
fetchJson @ api.ts:100
getTickets @ api.ts:837
fetchTickets @ TicketList.tsx:63
(anonymous) @ TicketList.tsx:57
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
commitRootImpl @ react-dom.development.js:26974
commitRoot @ react-dom.development.js:26721
performSyncWorkOnRoot @ react-dom.development.js:26156
flushSyncCallbacks @ react-dom.development.js:12042
(anonymous) @ react-dom.development.js:25690
setTimeout
scheduleFn @ notifyManager.ts:22
flush @ notifyManager.ts:37
batch @ notifyManager.ts:56
dispatch_fn @ query.ts:617
setData @ query.ts:218
onSuccess @ query.ts:507
resolve @ retryer.ts:107
Promise.then
run @ retryer.ts:159
start @ retryer.ts:218
fetch @ query.ts:540
executeFetch_fn @ queryObserver.ts:346
onSubscribe @ queryObserver.ts:108
subscribe @ subscribable.ts:11
(anonymous) @ useBaseQuery.ts:92
subscribeToStore @ react-dom.development.js:16139
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
api.ts:839  Error fetching tickets: Error: <!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <title>Page not found at /v1/tickets/</title>
  <meta name="robots" content="NONE,NOARCHIVE">
  <style>
    html * { padding:0; margin:0; }
    body * { padding:10px 20px; }
    body * * { padding:0; }
    body { font-family: sans-serif; background:#eee; color:#000; }
    body > :where(header, main, footer) { border-bottom:1px solid #ddd; }
    h1 { font-weight:normal; margin-bottom:.4em; }
    h1 small { font-size:60%; color:#666; font-weight:normal; }
    table { border:none; border-collapse: collapse; width:100%; }
    td, th { vertical-align:top; padding:2px 3px; }
    th { width:12em; text-align:right; color:#666; padding-right:.5em; }
    #info { background:#f6f6f6; }
    #info ol { margin: 0.5em 4em; }
    #info ol li { font-family: monospace; }
    #summary { background: #ffc; }
    #explanation { background:#eee; border-bottom: 0px none; }
    pre.exception_value { font-family: sans-serif; color: #575757; font-size: 1.5em; margin: 10px 0 10px 0; }
  </style>
</head>
<body>
  <header id="summary">
    <h1>Page not found <small>(404)</small></h1>
    
    <table class="meta">
      <tr>
        <th scope="row">Request Method:</th>
        <td>GET</td>
      </tr>
      <tr>
        <th scope="row">Request URL:</th>
        <td>http://127.0.0.1:8000/v1/tickets/</td>
      </tr>
      
    </table>
  </header>

  <main id="info">
    
      <p>
      Using the URLconf defined in <code>config.urls</code>,
      Django tried these URL patterns, in this order:
      </p>
      <ol>
        
          <li>
            
              <code>
                
                [name='home']
              </code>
            
          </li>
        
          <li>
            
              <code>
                favicon.ico
                [name='favicon']
              </code>
            
          </li>
        
          <li>
            
              <code>
                admin/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/schema/
                [name='schema']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/docs/
                [name='swagger-ui']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/
                [name='token_obtain_pair']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/refresh/
                [name='token_refresh']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                ^media/(?P&lt;path&gt;.*)$
                
              </code>
            
          </li>
        
      </ol>
      <p>
        
          The current path, <code>v1/tickets/</code>,
        
        didn’t match any of these.
      </p>
    
  </main>

  <footer id="explanation">
    <p>
      You’re seeing this error because you have <code>DEBUG = True</code> in
      your Django settings file. Change that to <code>False</code>, and Django
      will display a standard 404 page.
    </p>
  </footer>
</body>
</html>

    at simpleFetch (api.ts:92:11)
    at async RequestQueue.processRequest (requestQueue.ts:63:22)
    at async Promise.allSettled (index 0)
    at async RequestQueue.processQueue (requestQueue.ts:41:7)
getTickets @ api.ts:839
await in getTickets
fetchTickets @ TicketList.tsx:63
(anonymous) @ TicketList.tsx:57
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
commitRootImpl @ react-dom.development.js:26974
commitRoot @ react-dom.development.js:26721
performSyncWorkOnRoot @ react-dom.development.js:26156
flushSyncCallbacks @ react-dom.development.js:12042
(anonymous) @ react-dom.development.js:25690
setTimeout
scheduleFn @ notifyManager.ts:22
flush @ notifyManager.ts:37
batch @ notifyManager.ts:56
dispatch_fn @ query.ts:617
setData @ query.ts:218
onSuccess @ query.ts:507
resolve @ retryer.ts:107
Promise.then
run @ retryer.ts:159
start @ retryer.ts:218
fetch @ query.ts:540
executeFetch_fn @ queryObserver.ts:346
onSubscribe @ queryObserver.ts:108
subscribe @ subscribable.ts:11
(anonymous) @ useBaseQuery.ts:92
subscribeToStore @ react-dom.development.js:16139
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
TicketList.tsx:70  Error fetching tickets: Error: <!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <title>Page not found at /v1/tickets/</title>
  <meta name="robots" content="NONE,NOARCHIVE">
  <style>
    html * { padding:0; margin:0; }
    body * { padding:10px 20px; }
    body * * { padding:0; }
    body { font-family: sans-serif; background:#eee; color:#000; }
    body > :where(header, main, footer) { border-bottom:1px solid #ddd; }
    h1 { font-weight:normal; margin-bottom:.4em; }
    h1 small { font-size:60%; color:#666; font-weight:normal; }
    table { border:none; border-collapse: collapse; width:100%; }
    td, th { vertical-align:top; padding:2px 3px; }
    th { width:12em; text-align:right; color:#666; padding-right:.5em; }
    #info { background:#f6f6f6; }
    #info ol { margin: 0.5em 4em; }
    #info ol li { font-family: monospace; }
    #summary { background: #ffc; }
    #explanation { background:#eee; border-bottom: 0px none; }
    pre.exception_value { font-family: sans-serif; color: #575757; font-size: 1.5em; margin: 10px 0 10px 0; }
  </style>
</head>
<body>
  <header id="summary">
    <h1>Page not found <small>(404)</small></h1>
    
    <table class="meta">
      <tr>
        <th scope="row">Request Method:</th>
        <td>GET</td>
      </tr>
      <tr>
        <th scope="row">Request URL:</th>
        <td>http://127.0.0.1:8000/v1/tickets/</td>
      </tr>
      
    </table>
  </header>

  <main id="info">
    
      <p>
      Using the URLconf defined in <code>config.urls</code>,
      Django tried these URL patterns, in this order:
      </p>
      <ol>
        
          <li>
            
              <code>
                
                [name='home']
              </code>
            
          </li>
        
          <li>
            
              <code>
                favicon.ico
                [name='favicon']
              </code>
            
          </li>
        
          <li>
            
              <code>
                admin/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/schema/
                [name='schema']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/docs/
                [name='swagger-ui']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/
                [name='token_obtain_pair']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/token/refresh/
                [name='token_refresh']
              </code>
            
          </li>
        
          <li>
            
              <code>
                api/
                
              </code>
            
          </li>
        
          <li>
            
              <code>
                ^media/(?P&lt;path&gt;.*)$
                
              </code>
            
          </li>
        
      </ol>
      <p>
        
          The current path, <code>v1/tickets/</code>,
        
        didn’t match any of these.
      </p>
    
  </main>

  <footer id="explanation">
    <p>
      You’re seeing this error because you have <code>DEBUG = True</code> in
      your Django settings file. Change that to <code>False</code>, and Django
      will display a standard 404 page.
    </p>
  </footer>
</body>
</html>

    at simpleFetch (api.ts:92:11)
    at async RequestQueue.processRequest (requestQueue.ts:63:22)
    at async Promise.allSettled (index 0)
    at async RequestQueue.processQueue (requestQueue.ts:41:7)
fetchTickets @ TicketList.tsx:70
await in fetchTickets
(anonymous) @ TicketList.tsx:57
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
commitRootImpl @ react-dom.development.js:26974
commitRoot @ react-dom.development.js:26721
performSyncWorkOnRoot @ react-dom.development.js:26156
flushSyncCallbacks @ react-dom.development.js:12042
(anonymous) @ react-dom.development.js:25690
setTimeout
scheduleFn @ notifyManager.ts:22
flush @ notifyManager.ts:37
batch @ notifyManager.ts:56
dispatch_fn @ query.ts:617
setData @ query.ts:218
onSuccess @ query.ts:507
resolve @ retryer.ts:107
Promise.then
run @ retryer.ts:159
start @ retryer.ts:218
fetch @ query.ts:540
executeFetch_fn @ queryObserver.ts:346
onSubscribe @ queryObserver.ts:108
subscribe @ subscribable.ts:11
(anonymous) @ useBaseQuery.ts:92
subscribeToStore @ react-dom.development.js:16139
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
performSyncWorkOnRoot @ react-dom.development.js:26115
flushSyncCallbacks @ react-dom.development.js:12042
commitRootImpl @ react-dom.development.js:26998
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:26020
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
