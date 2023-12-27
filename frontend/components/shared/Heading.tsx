import Head from "next/head";
import React from "react";

type Props = {};

const Heading = (props: Props) => {
  return (
    <Head>
      <title>WinSolutions</title>
      <meta
        name="description"
        content="WinSolutions-Get Instant License In a Click"
      />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default Heading;
