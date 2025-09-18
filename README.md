# Nerdchat

This is a CLI that allows two way chat communication between friends over websockets sharing a LAN.

# Use

## Install

```sh
npm i -g nerdchat # Adds nerdchat, nerdserv
```

## Serve

If serving make sure to allow port 3831 `sudo ufw allow 3831/tcp`:

```sh
nerdserv 
```

This should print (with a different IP)

```sh
To serve, allow 3831 port via 'sudo ufw allow 3831/tcp' first
Server is up. Give this command to the person next to you:
nerdchat --server-url=ws://10.21.72.193:3831
```

## Chat

```sh
nerdchat --server-url=ws://10.21.72.193:3831
```