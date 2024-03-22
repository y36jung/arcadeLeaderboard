import { google } from 'googleapis';
import { useState } from 'react';
import { useSound } from 'use-sound';

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

    const [congratsA, setCongratsA] = useState(false);
    const [congratsB, setCongratsB] = useState(false);
    const [congratsC, setCongratsC] = useState(false);

    const [slotSfx] = useSound('/sounds/slot-machine-sound.mp3', {
      interrupt: true
    })
    const [raffleASfx] = useSound('/sounds/raffleASfx.mp3', {
      interrupt: true
    })
    const [raffleBCSfx] = useSound('/sounds/raffleBCSfx.mp3', {
      interrupt: true
    })

    const getRandomInt = (max) => {
      return Math.floor(Math.random() * max);
    }

    const randomNames = (pod) => {
      let raffleUsers = []
      let raffleWinner = ''

      if (pod === 'A') {
        raffleUsers = raffleAUsers
        raffleWinner = raffleAWinner
        setCongratsA(false)
      } else if (pod === 'B') {
        raffleUsers = raffleBUsers
        raffleWinner = raffleBWinner
        setCongratsB(false)
      } else if (pod === 'C') {
        raffleUsers = raffleCUsers
        raffleWinner = raffleCWinner
        setCongratsC(false)
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
            if (pod === 'A') {
              raffleASfx()
              setCongratsA(true)
            } else {
              raffleBCSfx()
              if (pod === 'B') {
                setCongratsB(true)
              } else if (pod === 'C') {
                setCongratsC(true)
              }
            }
          } else {
            slotSfx()
          }
          if (pod === 'A') {
            setPodiumA(user)            
          } else if (pod === 'B') {
            setPodiumB(user)          
          } else if (pod === 'C') {
            setPodiumC(user)
          }
          
        }, waitTime)
      }
    }

    return (
      <div className='container raffle-podium'>
        <div id='A' className='slide-up A'>
          <div className='raffleA floating'>{podiumA}</div>
          <div className='podiumA'>
            { congratsA && (
              <div className='podium-congrats'>
                <div>Congratulations</div>
                <br></br>
                <div>{podiumA}!</div>
              </div>
            )}
            <button className='reveal-button' onClick={() => randomNames('A')}>Reveal Raffle A Winner</button>
          </div>
        </div>
        <div id='B' className='slide-up B'>
          <div className='raffleB floating'>{podiumB}</div>
          <div className='podiumB'>
            { congratsB && (
              <div className='podium-congrats'> 
                <div>Congratulations</div>
                <br></br>
                <div>{podiumB}!</div>
              </div>
            )}
            <button className='reveal-button' onClick={() => randomNames('B')}>Reveal Raffle B Winner</button>
          </div>
        </div>
        <div id='C' className='slide-up C'>
          <div className='raffleC floating'>{podiumC}</div>
          <div className='podiumC'>
            { congratsC && (
              <div className='podium-congrats'>
                <div>Congratulations</div>
                <br></br>
                <div>{podiumC}!</div>
              </div>
            )}
            <button className='reveal-button' onClick={() => randomNames('C')}>Reveal Raffle C Winner</button>
          </div>
        </div>
      </div>

    )
}