"use client";

import React from "react";
import { Button } from "./ui/button";
import { getAurinkoAuthUrl } from "../lib/aurinko";

export const LinkAccountButton = () => {
  const handleLinkAccount = async () => {
    const authUrl = await getAurinkoAuthUrl("Google");
    const width = 1200;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.location.href = authUrl;
  };

  return <Button className="w-full" onClick={handleLinkAccount}>Link Account</Button>;
};
