const slackApiUrl = "https://slack.com/api";

const encodeForm = data =>
    Object.entries(data).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join("&");

const formRequest = (apiMethod, token, body = {}) => new Request(`${slackApiUrl}/${apiMethod}`, {
    body: encodeForm({...body, token}),
    method: "POST",
    headers: new Headers({
        "Content-type": "application/x-www-form-urlencoded"
    })
});

const jsonRequest = (apiMethod, token, body = {}) => new Request(`${slackApiUrl}/${apiMethod}`, {
    body: JSON.stringify(body),
    method: "POST",
    headers: new Headers({
        "Content-type": "application/json",
        "Authorization": `Bearer ${token}`
    })
});

const getRequest = (apiMethod, token) => new Request(`${slackApiUrl}/${apiMethod}`, {
    headers: new Headers({
        "Authorization": `Bearer ${token}`
    })
});

const fetchJson = request =>
    fetch(request).then(res => res.json());

const getUsers = async () => {
    const userList = await fetchJson(formRequest("users.list"));
    return Object.assign({}, ...userList.members.map(u => ({[u.id]: {
            name: u.name,
            realName: u.real_name,
            isBot: u.is_bot
        }})
    ));
};

const getChannels = async token => {
    const channelList = await fetchJson(formRequest("channels.list", token));
    return Object.assign({}, ...channelList.channels.map(c => ({[c.id]: {
            name: c.name
        }})
    ));
};

const postMessage = (message, token) => fetchJson(jsonRequest("chat.postMessage", token, message));

module.exports = {
    encodeForm, formRequest, fetchJson, getUsers, getChannels, postMessage, getRequest
};