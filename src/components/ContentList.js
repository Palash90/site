import "./ContentList.css"
import { FaPen, FaTrash } from "react-icons/fa";
function ContentLink(props) {
    var b = props.content
    var link = process.env.PUBLIC_URL + "/content/" + b.id;
    return <li key={b.id} className="d-flex align-items-center gap-2">

        {b.publishDate && props.showDate ?
            <>
                <span className="date">{b.publishDate}</span>
                <span>{" - "}</span></>
            : <></>}

        <span className="label">
            {b.noLink ? (
                <span className="text-secondary">{b.title}</span>
            ) : (
                <a className={window.findProp("pages.contents.linkClass")} href={link}>{b.title}</a>
            )}
        </span>

        <span className="d-flex gap-1">
            {b.editLink && (
                <a href={b.editLink} className="text-info" title="Edit score">
                    <FaPen size={11} />
                </a>
            )}
            {b.onDelete && (
                <a href="#" className="text-danger" title="Delete score"
                    onClick={(e) => { e.preventDefault(); b.onDelete(); }}>
                    <FaTrash size={11} />
                </a>
            )}
        </span>

    </li >
}

export default function ContentList(props) {
    var itemsPerPage = window.findProp("pages.contents.itemsPerPage");
    var allContents = window.findProp(props.type) || [];
    if (props.extraContents) {
        allContents = [...allContents, ...props.extraContents];
    }
    if (props.filter) {
        var q = props.filter.toLowerCase();
        allContents = allContents.filter(c => (c.title || "").toLowerCase().includes(q));
    }
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
                items.push(<ContentLink key={"content" + i + "-" + j} showDate={props.showDate} content={allContents[currentItemIndex]} />)
            }

        }
        columns.push(<ul key={"col" + i}>{items}</ul>);
    }

    return columns;
}

