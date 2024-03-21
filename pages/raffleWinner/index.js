import { google } from 'googleapis';
import { useState } from 'react';

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


    const raffleDataRange = `RECORDED!B2:F`;

    const raffleDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: raffleDataRange
    })

    const raffleWinnerArray = raffleWinnerResponse.data.values;

    const raffleDataArray = raffleDataResponse.data.values;

    const raffleAUsers = []
    const raffleBUsers = []
    const raffleCUsers = []

    raffleDataArray.map(([name, nickname, raffleA, raffleB, raffleC]) => {
      let user = nickname;
      if (nickname === undefined || nickname === '') {
        user = name;
      }

      if (raffleA > 0) {
        raffleAUsers.push(user)
      }
      if (raffleB > 0) {
        raffleBUsers.push(user)
      }
      if (raffleC > 0) {
        raffleCUsers.push(user)
      }
    })

    return {
      props: {
        raffleWinnerArray,
        raffleAUsers,
        raffleBUsers,
        raffleCUsers
      }
    }
}

export default function Home({ raffleWinnerArray, raffleAUsers, raffleBUsers, raffleCUsers }) {
    const raffleAWinner = raffleWinnerArray[0]
    const raffleBWinner = raffleWinnerArray[1]
    const raffleCWinner = raffleWinnerArray[2]

    const [podiumA, setPodiumA] = useState('Raffle A Winner')
    const [podiumB, setPodiumB] = useState('Raffle B Winner')
    const [podiumC, setPodiumC] = useState('Raffle C Winner')

    const getRandomInt = (max) => {
      return Math.floor(Math.random() * max);
    }

    const randomNames = (pod) => {
      let raffleUsers = []
      let raffleWinner = ''

      if (pod === 'A') {
        raffleUsers = raffleAUsers
        raffleWinner = raffleAWinner
      } else if (pod === 'B') {
        raffleUsers = raffleBUsers
        raffleWinner = raffleBWinner
      } else if (pod === 'C') {
        raffleUsers = raffleCUsers
        raffleWinner = raffleCWinner
      }

      let waitTime = 0
      const iter = 50
      for (let x = 0; x < iter; x++) {
        let counter = 150 
        if (x > 40) {
          counter = 150 * Math.exp(x/50)
        }
        waitTime += counter
        setTimeout(() => {
          let i = getRandomInt(raffleUsers.length)
          let user = raffleUsers[i]
          if (x === iter - 1) {
            user = raffleWinner
          }
          if (pod === 'A') {
            setPodiumA(user)
          } else if (pod === 'B') {
            setPodiumB(user)
          } else if (pod === 'C') {
            setPodiumC(user)
          }
          console.log(podiumA)
        }, waitTime)
      }
    }

    return (
      <div className='container raffle-podium'>
        <div id='A' className='slide-up A'>
          <div className='raffleA floating'>{podiumA}</div>
          <div className='podiumA'>
            <button className='reveal-button' onClick={() => randomNames('A')}>Reveal Raffle A Winner</button>
          </div>
        </div>
        <div id='B' className='slide-up B'>
          <div className='raffleB floating'>{podiumB}</div>
          <div className='podiumB'>
            <button className='reveal-button' onClick={() => randomNames('B')}>Reveal Raffle B Winner</button>
          </div>
        </div>
        <div id='C' className='slide-up C'>
          <div className='raffleC floating'>{podiumC}</div>
          <div className='podiumC'>
            <button className='reveal-button' onClick={() => randomNames('C')}>Reveal Raffle C Winner</button>
          </div>
        </div>
      </div>

    )
}