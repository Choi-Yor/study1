import React from 'react';
import Head from 'next/head';
import TodoList from '@/components/TodoList';

export default function Home() {
  return (
    <>
      <Head>
        <title>Todo & Notes App - Todos</title>
        <meta name="description" content="Todo and Notes application with Next.js and Django" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TodoList />
    </>
  );
}
