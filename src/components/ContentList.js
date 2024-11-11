import "./ContentList.css"
function ContentLink(props) {
    var b = props.content
    var link = process.env.PUBLIC_URL + "#/content/" + b.id;
    return <li key={b.id}>

        {b.publishDate && props.showDate ?
            <>
                <span className="date">{b.publishDate}</span>
                <span>{" - "}</span></>
            : <></>}

        <span className="label">
            <a className={window.findProp("pages.contents.linkClass")} href={link}>{b.title}</a>
        </span>

    </li >
}

export default function ContentList(props) {
    var itemsPerPage = window.findProp("pages.contents.itemsPerPage");
    var allContents = window.findProp(props.type);
    var numColumns = Math.ceil(allContents.length / itemsPerPage);
    var columns = []

    if (props.limit) {
        allContents = allContents.slice(0, Math.min(props.limit, allContents.length));
    }

    for (var i = 0; i < numColumns; i++) {
        var items = []
        for (var j = 0; j < itemsPerPage; j++) {
            var currentItemIndex = i * itemsPerPage + j;

            if (currentItemIndex < allContents.length) {
                items.push(<ContentLink showDate={props.showDate} content={allContents[currentItemIndex]} />)
            }

        }
        columns.push(<ul>{items}</ul>);
    }

    return columns;
}

