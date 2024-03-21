import { google } from 'googleapis';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export async function getServerSideProps({query}) {

    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']})

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
    const raffleA = raffleWinnerArray[0]
    const raffleB = raffleWinnerArray[1]
    const raffleC = raffleWinnerArray[2]

    return (
        <div>{raffleA}</div>
    )
}