import { google } from 'googleapis';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export async function getServerSideProps({query}) {

  const gcsKey = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_KEY, 'base64').toString()
  );

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: gcsKey.client_email,
      private_key: gcsKey.private_key
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })


    const sheets = google.sheets({ version: 'v4', auth});

    const raffleWinnerRange = 'RECORDED!J11:J13'

    const raffleWinnerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: raffleWinnerRange
    })

    const raffleWinnerArray = raffleWinnerResponse.data.values;

    return {
      props: {
        raffleWinnerArray
      }
    }
}

export default function Home({ raffleWinnerArray }) {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false)

  const refreshData = () => {
    router.push(router.asPath);
  }


  const checkValidResult = () => {
    for (const id in raffleWinnerArray) {
        const winner = raffleWinnerArray[id][0]
        if (winner === undefined || winner === 'Invalid ID' || winner=== null) {
            return false
        }
    }
    return true
  }

  console.log(raffleWinnerArray[0][0] === 'Invalid ID', checkValidResult())


  useEffect(() => {
    if (!checkValidResult()) {
      const interval = setInterval(() => {
        refreshData()
      }, 2000);
  
      return () => clearInterval(interval); 
    } else {
        setShowButton(true)
    }
  })

  return (
    <div className='container game-over'>
        <div className='title'>
            Game Over
        </div>
        <div className='subtitle'>Please stop all games as we prepare for the raffles!</div>
        <br></br>
        <br></br>
        { showButton && (
            <button onClick={() => router.push('/raffleWinner')}>
                Winners have been chosen!
                <br></br>
                Click to announce raffle winners!
            </button>
        )}
    </div>
  )
}