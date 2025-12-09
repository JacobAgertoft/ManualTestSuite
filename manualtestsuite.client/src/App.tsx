//import { useEffect, useState } from 'react'

//type WeatherForecast = {
//    date: string
//    temperatureC: number
//    summary: string
//}

//function App() {
//    const [data, setData] = useState < WeatherForecast[] > ([])
//    const [loading, setLoading] = useState(true)
//    const [error, setError] = useState < string | null > (null)

//    useEffect(() => {
//        const load = async () => {
//            try {
//                setLoading(true)
//                setError(null)

//                // Because of the Vite proxy, this will go to https://localhost:7008/weatherforecast
//                const res = await fetch('/weatherforecast')

//                if (!res.ok) {
//                    throw new Error(`Request failed with status ${res.status}`)
//                }

//                const json = await res.json()
//                setData(json)
//            } catch (err: any) {
//                setError(err.message ?? 'Unknown error')
//            } finally {
//                setLoading(false)
//            }
//        }

//        load()
//    }, [])

//    if (loading) {
//        return <div style={{ padding: 24 }}>Loading weather data…</div>
//    }

//    if (error) {
//        return (
//            <div style={{ padding: 24, color: 'red' }}>
//                Error loading data: {error}
//            </div>
//        )
//    }

//    return (
//        <div style={{ padding: 24 }}>
//            <h1>Weather Forecast</h1>
//            {data.length === 0 ? (
//                <p>No data received.</p>
//            ) : (
//                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
//                    <thead>
//                        <tr>
//                            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Date</th>
//                            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Temp (°C)</th>
//                            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Summary</th>
//                        </tr>
//                    </thead>
//                    <tbody>
//                        {data.map((item, i) => (
//                            <tr key={i}>
//                                <td style={{ padding: '4px 0' }}>{new Date(item.date).toLocaleString()}</td>
//                                <td style={{ padding: '4px 0' }}>{item.temperatureC}</td>
//                                <td style={{ padding: '4px 0' }}>{item.summary}</td>
//                            </tr>
//                        ))}
//                    </tbody>
//                </table>
//            )}
//        </div>
//    )
//}

//export default App

import { Projects } from './Projects'

function App() {
    return <Projects />
}

export default App

