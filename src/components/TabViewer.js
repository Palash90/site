import { useState, useEffect } from "react";
import GuitaleleViewer from "./GuitaleleViewer";

export default function TabViewer(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch(props.tab)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                //setData(JSON.parse(data));
                let d = {
                    "title": "Guitalele Default Tuning",
                    "description": "The default tuning for a guitalele is A-D-G-C-E-A",
                    "timeSignature": "4/4",
                    "notes": [
                        {
                            "fret": 0,
                            "string": 6,
                            "duration": 1,
                            "tie": true
                        },
                        {
                            "fret": 0,
                            "string": 5,
                            "duration": 1
                        },
                        {
                            "fret": 0,
                            "string": 4,
                            "duration": 1
                        },
                        {
                            "fret": 0,
                            "string": 3,
                            "duration": 1
                        },
                        {
                            "fret": 0,
                            "string": 2,
                            "duration": 1
                        },
                        {
                            "fret": 16,
                            "string": 1,
                            "duration": 1
                        }
                    ]
                }
                setData(d);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, [props.tab]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return <div>
        <h3>Associated Tab</h3>
        <GuitaleleViewer scoreData={data} />
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre> //  Insert the guitalele tab viewer here, using the data fetched from the URL in props.tab
    </div>
}

