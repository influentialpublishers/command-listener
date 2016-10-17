# command-listener
A routable command listener. You got a command, yo I'll run it,
check out the hook whilst my router resolves it.


```purescript

type Message =
  { id       :: String
  , command  :: String
  , resource :: JSON
  , payload  :: JSON
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
