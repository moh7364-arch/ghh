function renderChat(messages){
    let chat = document.getElementById('chat-messages');
    chat.innerHTML = messages.map(m=>`<div><b>${m.user}:</b> ${m.msg}</div>`).join('');
}
