"use client";

import { withAccount, withAuth } from "@/app/providers/auth";
import { MapPage } from "@/pages-root/map";

export default withAuth(withAccount(MapPage));
