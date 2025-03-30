import React from 'react';
import Head from 'next/head';
import NoteList from '@/components/NoteList';

export default function Notes() {
  return (
    <>
      <Head>
        <title>Notes - Todo App</title>
        <meta name="description" content="Notes section of the Todo application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NoteList />
    </>
  );
}
