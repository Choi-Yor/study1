import React from 'react';
import Head from 'next/head';
import TodayList from '@/components/TodayList';

const TodayPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Today's Tasks</title>
        <meta name="description" content="View tasks due today" />
      </Head>
      <TodayList />
    </>
  );
};

export default TodayPage;
