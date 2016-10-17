# command-listener
A routable command listener. You got a command, yo I'll run it,
check out the hook whilst my router resolves it.


```purescript

import Data.Foreign
import Data.Foreign.Class

type Message =
  { id       :: String
  , command  :: String
  , resource :: F a
  , payload  :: F a
  }


type Status
  = OK
  | FAIL
  | REQUEUE
  | PRIORITY_REQUEUE Number


type Response =
  { message :: Message
  , status  :: Status
  }
```
