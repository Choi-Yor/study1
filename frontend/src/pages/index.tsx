import React from 'react';
import Head from 'next/head';
import TodoList from '@/components/TodoList';

export default function Home() {
  return (
    <>
      <Head>
        <title>Todo App</title>
        <meta name="description" content="Todo application with Next.js and Django" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TodoList />
    </>
  );
}
