import { google } from 'googleapis';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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

    const raffleDataRange = `SORTED!B2:F`;
    const goldenTimeCheckRange = 'RECORDED!J8'

    const raffleDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: raffleDataRange
    })

    const goldenTimeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: goldenTimeCheckRange
    })

    const leaderboardArray = raffleDataResponse.data.values;
    const leaderboardObjects = Object.assign(leaderboardArray.map(([name, nickname, raffleA, raffleB, raffleC]) => 
                                                ({'name': name, 'nickname': nickname, 'raffleA': raffleA, 'raffleB': raffleB, 'raffleC': raffleC})
                                            ))

    const goldenTimeBool = goldenTimeResponse.data.values[0][0];

    return {
      props: {
        leaderboardObjects,
        goldenTimeBool
      }
    }
}

export default function Home({ leaderboardObjects, goldenTimeBool }) {
  const router = useRouter();
  const size = leaderboardObjects.length;
  
  // 'Soft' reloards page and fetched fresh data
  const refreshData = () => {
    router.push(router.asPath);
  }

  // Resets and restarts leaderboard animation
  const restartAnimation = () => {
    if (typeof document !== "undefined" && goldenTimeBool === 'FALSE') {
      let el = document.getElementById('board-animation');
      if (el) {
        el.classList.add('move-down')
        document.documentElement.style.setProperty("--numOfScores", size)
        el.addEventListener('animationend', function() {
          el.classList.remove('move-down')
        })
      }
    }
  }

  // Adds rank suffix behind each rank
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

  // Restart animation whenever page is rendered/re-rendered
  restartAnimation()

  // Retreiving fresh data from Google Sheets per interval
  useEffect(() => {
    let timeInterval = (500 * size) + 5000
    if (goldenTimeBool !== 'TRUE') {
      const interval = setInterval(() => {
        refreshData()
      }, timeInterval);
  
      return () => clearInterval(interval); 
    }

  }, []) 

  useEffect(() => {
    // Redirect to Golden Time Page
    if (goldenTimeBool === 'TRUE') {
      console.log('To golden time')
      router.push('/goldenTime')
    }
  }, [goldenTimeBool])

  return (
    <div className='container leaderboard'>
      <div className='title'>HIGH SCORE</div>
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