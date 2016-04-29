'use strict';

const $time = document.querySelector('#time');
const $greeting = document.querySelector('#greeting');
const $bookmarksDrawer = document.querySelector('#bookmarks-drawer');
const $bookmarksOpenButton = document.querySelector('#bookmarks-open-button');
const $bookmarksCloseButton = document.querySelector('#bookmarks-close-button');
const $bookmarksParentFolder =
  document.querySelector('#bookmarks-parent-folder');
const $bookmarksDrawerItems = document.querySelector('#bookmarks-drawer-items');
const $drawerBackdrop = document.querySelector('#drawer-backdrop');

let bookmarkManager = {
  stack: [],

  init(root) {
    this.stack[0] = root;
    this.openNode();
  },

  getCurrentNode() {
    return this.stack[this.stack.length - 1];
  },

  ascend() {
    if (this.stack.length > 1) {
      this.stack.pop();
      this.openNode();
    }
  },

  openNode(node = null) {
    if (node) {
      this.stack.push(node);
    } else {
      node = this.getCurrentNode();
    }

    if (node.url) {
      return;
    }

    let children = node.children || [];
    let elements = $bookmarksDrawerItems.childNodes;

    while (children.length < elements.length) {
      $bookmarksDrawerItems.removeChild($bookmarksDrawerItems.lastChild);
    }

    children.forEach((child, i) => {
      let bookmark = elements[i];
      if (!bookmark) {
        bookmark = document.createElement('x-bookmark');
        $bookmarksDrawerItems.appendChild(bookmark);
      }

      bookmark.setNode(child);
    });
  },
};

chrome.bookmarks.getTree(tree => {
  let root = tree[0];
  bookmarkManager.init(root);
});

$bookmarksParentFolder.addEventListener('bookmark-clicked', () => {
  bookmarkManager.ascend();
});

$bookmarksDrawerItems.addEventListener('bookmark-clicked', event => {
  bookmarkManager.openNode(event.detail.node);
}, true);

updateTime();
setInterval(updateTime, 1000);

$bookmarksOpenButton.addEventListener('click', openBookmarks);
$bookmarksCloseButton.addEventListener('click', closeBookmarks);
$drawerBackdrop.addEventListener('click', closeBookmarks);

function updateTime() {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  let minutesStr = String(minutes);
  if (minutesStr.length < 2) {
    minutesStr = `0${minutesStr}`;
  }

  $time.textContent = `${hours % 12}:${minutesStr}`;

  let greeting;
  if (hours >= 0 && hours < 12) {
    greeting = 'Good Morning';
  } else if (hours >= 12 && hours < 18) {
    greeting = 'Good Afternoon';
  } else {
    greeting = 'Good Evening';
  }

  $greeting.textContent = greeting;
}

function openBookmarks() {
  document.body.classList.add('bookmarks-drawer-open');
}

function closeBookmarks() {
  document.body.classList.remove('bookmarks-drawer-open');
}
