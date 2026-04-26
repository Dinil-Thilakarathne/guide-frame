"use client";

import { GuideframeGrid } from "@guideframe/react";

export default function GuideframeClient() {
  return (
    <>
      <GuideframeGrid
        columns={{ desktop: 6, tablet: 4, mobile: 3 }}
        opacity={0.05}
        maxWidth={678}
        margin={8}
        gutter={8}
        forceVisibleInProduction={true}
      />
    </>
  );
}
