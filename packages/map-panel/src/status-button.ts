import { useState, useCallback, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Button, IconName, Intent } from "@blueprintjs/core";
import h from "@macrostrat/hyper";

function useSocketStatus(socket: Socket) {
  /** An expanded function to check whether a SocketIO connection is connected */
  const [reconnectAttempt, setReconnectAttempt] = useState(1);
  const [hasEverConnected, setConnected] = useState(false);

  const isOpen = socket.connected;
  //const isOpen = socket.io._readyState == "open";

  const tryToReconnect = useCallback(() => {
    if (isOpen) setReconnectAttempt(reconnectAttempt + 1);
  }, [setReconnectAttempt, isOpen, reconnectAttempt]);

  useEffect(() => {
    if (isOpen) setConnected(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) socket.connect();
  }, [reconnectAttempt]);

  const res = {
    reconnectAttempt,
    hasEverConnected,
    tryToReconnect,
    isOpen,
  };
  console.log(res);

  return res;
}

export function SocketStatusButton({ socket, resource = "Server", ...rest }) {
  const { isOpen, tryToReconnect, hasEverConnected } = useSocketStatus(socket);

  let icon: IconName = "tick";
  let intent: Intent = "success";
  let text: string = `${resource} connected`;
  if (!hasEverConnected) {
    icon = "error";
    intent = "danger";
    text = `${resource} not found`;
  } else if (!isOpen) {
    icon = "warning-sign";
    intent = "warning";
    text = `${resource} disconnected`;
  }

  return h(
    Button,
    {
      minimal: true,
      small: true,
      icon,
      intent,
      onClick() {
        tryToReconnect();
      },
      ...rest,
    },
    text
  );
}
