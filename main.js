
function createAttrNode(attrName, attrValue) {
  const attr = document.createAttribute(attrName);
  attr.value = attrValue;
  return attr
}

function insertText(id, content) {
  document.getElementById(id).appendChild(document.createTextNode(content));
}

const VALID_STREAMS = [
  'page-create',
  'page-delete',
  'page-links-change',
  'page-move',
  'page-properties-change',
  'page-undelete',
  'recentchange',
  'revision-create',
  'revision-score'
];

function getStreamFromParams() {
  const searchParams = (new URL(document.location)).searchParams;
  const stream = searchParams.get('stream');
  if(!!stream && VALID_STREAMS.includes(stream)) {
    return stream;
  } 
  return VALID_STREAMS[0];
}

function readStream(wikimediaStream) {
  const wikimediaEventStream = 'https://stream.wikimedia.org/v2/stream'
  const eventSourceResource = `${wikimediaEventStream}/${wikimediaStream}`
  const eventSource = new EventSource(eventSourceResource);

  eventSource.onopen = function() {
    console.log(`Event stream opened: ${eventSourceResource}`);
  };

  eventSource.onerror = function(msg) {
    console.error(`The event stream ${eventSourceResource} errored with message: ${msg}`);
  };

  eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);

    console.log(data);

    const uri = data.meta.uri || '';
    const pageTitle = data.page_title || '[NO PAGE TITLE]';

    const aEl = document.createElement('a');
    aEl.appendChild(document.createTextNode(pageTitle));
    // a tag attrs
    aEl.setAttributeNode(createAttrNode('href', uri));
    aEl.setAttributeNode(createAttrNode('target', '_blank'));

    const liEl = document.createElement('li');
    liEl.appendChild(aEl);
    document.getElementById('event-list').appendChild(liEl);
  };
}

function initSelect(wikimediaStream) {
  const notSelectedOpts = VALID_STREAMS.filter(s => s !== wikimediaStream);

  const selectEl = document.getElementById('selected-stream');

  const optionEl = document.createElement('option');
  optionEl.appendChild(document.createTextNode(wikimediaStream));
  selectEl.appendChild(optionEl);

  notSelectedOpts.forEach(opt => {
    const optionEl = document.createElement('option');
    optionEl.appendChild(document.createTextNode(opt));
    selectEl.appendChild(optionEl);
  });

  // Add event listener to select
  selectEl.addEventListener('change', (event) => {
    window.location.search = `stream=${event.target.value}`;
  });
}

(function() {
  // https://developer.mozilla.org/en-US/docs/Web/API/EventSource
  const wikimediaStream = getStreamFromParams();

  initSelect(wikimediaStream);

  insertText('stream-type', wikimediaStream);

  readStream(wikimediaStream);
}());
