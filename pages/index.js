import { google } from 'googleapis';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export async function getServerSideProps({query}) {

    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']})

    const sheets = google.sheets({ version: 'v4', auth});

    const range = `SORTED!A2:E`;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range,
    })

    const leaderboardArray = response.data.values;

    const leaderboardObjects = Object.assign(leaderboardArray.map(([name, nickname, raffleA, raffleB, raffleC]) => 
                                                ({'name': name, 'nickname': nickname, 'raffleA': raffleA, 'raffleB': raffleB, 'raffleC': raffleC})
                                            ))
    return {
      props: {
        leaderboardObjects
      }
    }
}

export default function Post({ leaderboardObjects }) {
  const router = useRouter();
  const size = leaderboardObjects.length;
  
  // 'Soft' reloards page and fetched fresh data
  const refreshData = () => {
    router.push(router.asPath);
  }

  const restartAnimation = () => {
    if (typeof document !== "undefined") {
      let el = document.getElementById('board-animation');
      el.classList.add('move-down')
      document.documentElement.style.setProperty("--numOfScores", size)
      console.log('size', size)
      el.addEventListener('animationend', function() {
        el.classList.remove('move-down')
      })
    }
  }

  const rankSuffix = (rank) => {
    let suffix = 'th'
    if (rank % 10 === 1) {
      suffix = 'st' 
    } else if (rank % 10 === 2) {
      suffix = 'nd'
    } else if (rank % 10 === 3) {
      suffix = 'rd'
    }
    return suffix
  }

  restartAnimation()
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
      console.log('Data has been refreshed!')
    }, (500 * size) + 5000);
  }, []) 

  return (
    <div className='main-container'>
      <div className='title'>High Score</div>
      <table className='table-container'>
        <thead className='title-body'>
          <tr>
            <th className='col-rank'>Rank</th>
            <th className='col-name'>User</th>
            <th className='col-raffle'>Raffle  A</th>
            <th className='col-raffle'>Raffle  B</th>
            <th className='col-raffle'>Raffle  C</th>
          </tr>
        </thead>
        <tbody id='board-animation' className='score-body'>
          { leaderboardObjects.map(obj => {
            const rank = leaderboardObjects.indexOf(obj) + 1
            let rankColor = ''
            if (rank === 1) {
              rankColor = 'first'
            } else if (rank === 2) {
              rankColor = 'second'
            } else if (rank === 3) {
              rankColor = 'third'
            }
             
            return (
              <tr className={rankColor}>
                <td className='col-rank'>
                  {rank}
                  {rankSuffix(rank)}
                </td>
                <td className='col-name'>{obj.nickname.length === 0 ? obj.name : obj.nickname}</td>
                <td className='col-raffle'>{obj.raffleA}</td>
                <td className='col-raffle'>{obj.raffleB}</td>
                <td className='col-raffle'>{obj.raffleC}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className='bottom-box'></div>
    </div>
  )
}