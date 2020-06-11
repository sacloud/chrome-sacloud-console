/**
 * Copyright 2020 The UsaCon Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import {
  AppBar,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import CancelRoundedIcon from "@material-ui/icons/CancelRounded";
import APIKeyDialog from "./APIKeyDialog";
import ConsoleWrapper from "./ConsoleWrapper";
import { Usacon } from "../usacon";
import CurrentAPIKey from "./CurrentAPIKey";
import { AddCircleRounded } from "@material-ui/icons";

const defaultDrawerHeight = 500;
const minDrawerHeight = 50;
const maxDrawerHeight = 800;

const useStyles = makeStyles((theme) => ({
  toolBar: {
    minHeight: 48,
    paddingRight: 5,
  },
  logo: {
    maxHeight: 40,
  },
  drawer: {
    flexShrink: 0,
    zIndex: 100,
    overflowY: "hidden",
  },
  dragger: {
    overflowY: "hidden",
    width: "100%",
    cursor: "row-resize",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    height: 1,
    zIndex: 1110,
  },
  icons: {
    marginLeft: "auto",
  },
}));

export type BottomDrawerProps = {
  usacon: Usacon;
};

const BottomDrawer: React.FC<BottomDrawerProps> = (props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = React.useState(defaultDrawerHeight);
  const [apiKeyInputOpen, setAPIKeyInputOpen] = React.useState(false);
  const ref = React.createRef<HTMLDivElement>();

  useEffect(() => {
    const consoleRoot = ref.current;
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (
        typeof message === "object" &&
        message.type === "usacon.toggleConsoleVisible"
      ) {
        setOpen((current) => !current);
        if (consoleRoot && !props.usacon.isOpen) {
          props.usacon.open(consoleRoot);
        }
      }
    });
  }, [props]);

  const handleMouseDown = () => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
    document.body.style.userSelect = "none";
  };

  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
    document.body.style.userSelect = "inherit";
  };

  const handleMouseMove = useCallback((e) => {
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > minDrawerHeight && newHeight < maxDrawerHeight) {
      setDrawerHeight(newHeight);
      props.usacon.term.fit();
    }
  }, []);

  const handleAPIKeyButtonClick = () => {
    navigator.credentials.preventSilentAccess();
    setAPIKeyInputOpen(true);
  };

  const handleAPIKeyInputClose = () => {
    setAPIKeyInputOpen(false);
  };

  const handleCloseButtonClick = () => {
    setOpen(false);
  };

  return (
    <div hidden={!open}>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        PaperProps={{ style: { height: drawerHeight, overflowY: "hidden" } }}
        anchor={"bottom"}
      >
        <div
          onMouseDown={(e) => handleMouseDown()}
          className={classes.dragger}
        />
        <AppBar color={"default"} position={"relative"}>
          <Toolbar className={classes.toolBar}>
            <img
              src={chrome.runtime.getURL("usacloud-horizontal.svg")}
              className={classes.logo}
            />
            <div className={classes.icons}>
              <CurrentAPIKey usacon={props.usacon} />
              <Tooltip title="Add API Key">
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={handleAPIKeyButtonClick}
                >
                  <AddCircleRounded />
                  <Typography variant="body1">Add API Key</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton
                  edge="start"
                  color="default"
                  onClick={handleCloseButtonClick}
                >
                  <CancelRoundedIcon />
                </IconButton>
              </Tooltip>
            </div>
          </Toolbar>
        </AppBar>
        <ConsoleWrapper ref={ref} />
        <APIKeyDialog open={apiKeyInputOpen} onClose={handleAPIKeyInputClose} />
      </Drawer>
    </div>
  );
};

export default BottomDrawer;