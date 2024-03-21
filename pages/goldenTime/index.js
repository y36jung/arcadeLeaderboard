import { google } from 'googleapis';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export async function getServerSideProps({query}) {

    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']})

    const sheets = google.sheets({ version: 'v4', auth});

    const goldenTimeCheckRange = 'RECORDED!J8'

    const raffleWinnerRange = 'RECORDED!J9'

    const goldenTimeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: goldenTimeCheckRange
    })

    const goldenTimeBool = goldenTimeResponse.data.values[0][0];

    const raffleWinnerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: raffleWinnerRange
    })

    const raffleWinnerBool = raffleWinnerResponse.data.values[0][0]

    return {
      props: {
        goldenTimeBool,
        raffleWinnerBool
      }
    }
}

export default function Home({ goldenTimeBool, raffleWinnerBool }) {
  const router = useRouter();
  const goldenTimeMinutes = 0.5
  const [countDown, setCountDown] = useState(goldenTimeMinutes * 6000)

  const secondsToTimer = (ms) => {
    const minute = Math.floor(ms / 6000)
    const seconds = Math.floor((ms % 6000) / 100)
    const miliseconds = ms % 100
    const countTimer = {
        minute: minute,
        seconds: seconds,
        miliseconds: miliseconds
    }
    return countTimer
  }

  // Adds zero in front of single digit numbers
  const addZeroPrefix = (num) => {
    if (num < 10) {
        return `0${num}`
    } else {
        return num
    }
  }
  
  // 'Soft' reloards page and fetched fresh data
  const refreshData = () => {
    router.push(router.asPath);
  }

  //Countdown timer for Golden Time
  useEffect(() => {
    if (goldenTimeBool === 'TRUE' && countDown > 0) {
      const interval = setInterval(() => {
        setCountDown(prevState => prevState - 1)
      }, 10);

      return () => clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (countDown < 0 ) {
      router.push('/gameOver')
    }
  }, [countDown])

  return (
    <div className='container golden-time'>
        <div className='title'>GOLDEN TIME!</div>
        <div className='golden-timer'>
          { countDown > 0 ? (
            <>
              {addZeroPrefix(secondsToTimer(countDown).minute)}: 
              {addZeroPrefix(secondsToTimer(countDown).seconds)}: 
              {addZeroPrefix(secondsToTimer(countDown).miliseconds)}
            </>
          ) : (
            <>
              {addZeroPrefix(0)}: 
              {addZeroPrefix(0)}: 
              {addZeroPrefix(0)}
            </>
          )}
            
        </div>
        <div className='subtitle'>All coins earned are doubled!</div>
    </div>
  )
}