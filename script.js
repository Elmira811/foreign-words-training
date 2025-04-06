"use strict";

const words = ['home', 'dog', 'book', 'carrot', 'flower'];
const translations = [
  {name: 'дом',
   example: 'He is home alone.'
  },
  {name: 'собака',
   example: 'The dog is barking loudly.'
  },
  {name: 'книга',
   example: 'This is my favourite book.'
  },
  {name: 'морковь',
   example: 'Rabbits like eating carrots.'
  },
  {name: 'цветок',
   example: 'Rose is a beautiful flower.'
  }
];

const flipCard = document.querySelector('.flip-card');
const cardFront = document.querySelector('#card-front');
const cardBack = document.querySelector('#card-back');
const buttonBack = document.querySelector('#back');
const buttonNext = document.querySelector('#next');
const buttonExam = document.querySelector('#exam');
const progress = document.querySelector('#words-progress');
const shuffleButton = document.querySelector('#shuffle-words');
const currentWord = document.querySelector('#current-word');
const studyMode = document.querySelector('#study-mode');
const studyCards = document.querySelector('.study-cards');
const examContainer = document.querySelector('#exam-cards');
const examMode = document.querySelector('#exam-mode');
const timer = document.querySelector('#time');
const examProgress = document.querySelector('#exam-progress');
const correctPercent = document.querySelector('#correct-percent');
const resultsModal = document.querySelector('.results-modal');
const resultsContainer = document.querySelector('.results-content');
const resultsTimer = document.querySelector('#timer');
const template = document.querySelector('#word-stats');


let currentIndex = 0;
let firstCard;
let secondCard;
let seconds = 0;
let minutes = 0;
let attempts = {};


function updateCard() {
  currentWord.textContent = currentIndex + 1;

  cardFront.querySelector('h1').textContent = words[currentIndex];
  cardBack.querySelector('h1').textContent = translations[currentIndex].name;
  cardBack.querySelector('span').textContent = translations[currentIndex].example;

  buttonBack.disabled = currentIndex === 0;
  buttonNext.disabled = currentIndex === words.length - 1;

  progress.value = ((currentIndex + 1) / words.length) * 100;
};

function getExamCards() {
  const examCards = [];

  for (let i = 0; i < words.length; i++) {
    examCards.push(words[i], translations[i].name);
  };

  examCards.sort(() => Math.random() - 0.5);

  examCards.forEach(function(item) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = item;
    examContainer.append(card);
  })
};

function resetSelection() {
  firstCard.classList.remove('correct');
  firstCard = null;
  secondCard = null;
};

function format(val) {
  if (val < 10) {
    return `0${val}`;
  }

  return val;
};

function setTimer() {
  const timerId = setInterval(() => {
    seconds++;
  
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
  
    timer.textContent = `${format(minutes)}:${format(seconds)}`;

    if (document.querySelectorAll('.card').length === 
    document.querySelectorAll('.card.fade-out').length) {
      clearInterval(timerId);
      resultsModal.classList.remove('hidden');
      resultsTimer.textContent = timer.textContent;
      makeResultsTable();
    }
  }, 1000);
};

function makeResultsTable() {
  words.forEach(function(item) {
    const resultsTable = template.content.cloneNode(true);
    resultsTable.querySelector('.word span').textContent = item;
    resultsTable.querySelector('.attempts span').textContent = attempts[item];
    resultsContainer.append(resultsTable);
  })
};

updateCard();

flipCard.addEventListener('click', function() {
  flipCard.classList.toggle('active');
});

buttonNext.addEventListener('click', function() {
  if (currentIndex < words.length - 1) {
    currentIndex++;
    updateCard();
  }
});

buttonBack.addEventListener('click', function() {
  if (currentIndex > 0) {
    currentIndex--;
    updateCard();
  }
});

shuffleButton.addEventListener('click', function() {
  const pairs = words.map((item, index) => ({
    word: item,
    translations: translations[index]
  }));

  pairs.sort(() => Math.random() - 0.5);

  pairs.forEach((item, index) => {
    words[index] = item.word;
    translations[index] = item.translations;
  });

  updateCard();
});

buttonExam.addEventListener('click', function() {
  studyMode.classList.add('hidden');
  studyCards.classList.add('hidden');
  examMode.classList.remove('hidden');

  currentIndex = 0;

  getExamCards();
  setTimer(); 
});

examContainer.addEventListener('click', function(event) {
  const clickedCard = event.target.closest('.card');
  
  if (!clickedCard || clickedCard.classList.contains('fade-out')) return;
  
  const cardText = clickedCard.textContent;
  attempts[cardText] = (attempts[cardText] || 0) + 1;

  if(!firstCard) {
    firstCard = clickedCard;
    firstCard.classList.add('correct');
    return;
  };

  secondCard = clickedCard;

  const firstCardIndex = words.indexOf(firstCard.textContent);
  const secondCardIndex = translations.findIndex((item) => item.name === secondCard.textContent);

  const reverseFirstCardIndex = translations.findIndex((item) => item.name === firstCard.textContent);
  const reverseSecondCardIndex = words.indexOf(secondCard.textContent);

  if ((firstCardIndex !== -1 && firstCardIndex === secondCardIndex) || 
  (reverseFirstCardIndex !== -1 && reverseFirstCardIndex === reverseSecondCardIndex)) {
    secondCard.classList.add('correct', 'fade-out');
    firstCard.classList.add('fade-out');
    currentIndex++;
    examProgress.value = Math.round((currentIndex / words.length) * 100);
    correctPercent.textContent = `${examProgress.value}%`;
    resetSelection();
  } else {
    secondCard.classList.add('wrong');
    setTimeout(() => {
      secondCard.classList.remove('wrong');
      resetSelection();
    } , 500);
  };
})