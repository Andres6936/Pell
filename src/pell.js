const defaultParagraphSeparatorString = 'defaultParagraphSeparator'
const formatBlock = 'formatBlock'

export const exec = (command, value = null) => document.execCommand(command, false, value)

const defaultClasses = {
    actionbar: 'pell-actionbar',
    button: 'pell-button',
    content: 'pell-content',
    selected: 'pell-button-selected'
}

const defaultActions = [
    {
        icon: '<b>B</b>',
        title: 'Bold',
        state: () => document.queryCommandState('bold'),
        result: () => exec('bold')
    },
    {
        icon: '<i>I</i>',
        title: 'Italic',
        state: () => document.queryCommandState('italic'),
        result: () => exec('italic')
    },
    {
        icon: '<u>U</u>',
        title: 'Underline',
        state: () => document.queryCommandState('underline'),
        result: () => exec('underline')
    },
    {
        icon: '<strike>S</strike>',
        title: 'Strike-through',
        state: () => document.queryCommandState('strikeThrough'),
        result: () => exec('strikeThrough')
    },
    {
        icon: '<b>H<sub>1</sub></b>',
        title: 'Heading 1',
        result: () => exec(formatBlock, '<h1>')
    },
    {
        icon: '<b>H<sub>2</sub></b>',
        title: 'Heading 2',
        result: () => exec(formatBlock, '<h2>')
    },
    {
        icon: '&#182;',
        title: 'Paragraph',
        result: () => exec(formatBlock, '<p>')
    },
    {
        icon: '&#8220; &#8221;',
        title: 'Quote',
        result: () => exec(formatBlock, '<blockquote>')
    },
    {
        icon: '&#35;',
        title: 'Ordered List',
        result: () => exec('insertOrderedList')
    },
    {
        icon: '&#8226;',
        title: 'Unordered List',
        result: () => exec('insertUnorderedList')
    },
    {
        icon: '&lt;/&gt;',
        title: 'Code',
        result: () => exec(formatBlock, '<pre>')
    },
    {
        icon: '&#8213;',
        title: 'Horizontal Line',
        result: () => exec('insertHorizontalRule')
    },
    {
        icon: '&#128279;',
        title: 'Link',
        result: () => {
            const url = window.prompt('Enter the link URL')
            if (url) exec('createLink', url)
        }
    },
    {
        icon: '&#128247;',
        title: 'Image',
        result: () => {
            const url = window.prompt('Enter the image URL')
            if (url) exec('insertImage', url)
        }
    }
]

export class Pell {

    constructor(settings) {

        // @type {string: actionbar, string: button, string: content,
        // string: selected} The custom class for the elements in the Editor.
        const classes = {...defaultClasses, ...settings.classes}

        // @type {string} The default paragraph separator, can be 'p' or 'div'.
        const defaultParagraphSeparator = settings[defaultParagraphSeparatorString] || 'div'

        // @type {HTMLDivElement} The action bar element
        const actionbar = document.createElement('div')
        actionbar.className = classes.actionbar
        settings.element.appendChild(actionbar);

        const content = settings.element.content = document.createElement('div')
        content.contentEditable = true
        content.className = classes.content
        content.oninput = ({target: {firstChild}}) => {
            if (firstChild && firstChild.nodeType === 3) exec(formatBlock, `<${defaultParagraphSeparator}>`)
            else if (content.innerHTML === '<br>') content.innerHTML = ''
            settings.onChange(content.innerHTML)
        }
        content.onkeydown = event => {
            if (event.key === 'Enter' && document.queryCommandValue(formatBlock) === 'blockquote') {
                setTimeout(() => exec(formatBlock, `<${defaultParagraphSeparator}>`), 0)
            }
        }
        settings.element.appendChild(content);

        defaultActions.forEach(action => {
            const button = document.createElement('button')
            button.className = classes.button
            button.innerHTML = action.icon
            button.title = action.title
            button.setAttribute('type', 'button')
            button.onclick = () => action.result() && content.focus()

            if (action.state) {
                const handler = () => button.classList[action.state() ? 'add' : 'remove'](classes.selected)
                content.addEventListener('keyup', handler);
                content.addEventListener('mouseup', handler);
                button.addEventListener('click', handler);
            }

            actionbar.appendChild(button);
        })

        if (settings.styleWithCSS) exec('styleWithCSS')
        exec(defaultParagraphSeparatorString, defaultParagraphSeparator)
    }
}
