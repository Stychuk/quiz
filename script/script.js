import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getDatabase, ref, child, get, set, push } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyD2AncLk4zw1dMPUR1yZuOAnmDER7wiVxo",
    authDomain: "quiz-test-65611.firebaseapp.com",
    databaseURL: "https://quiz-test-65611-default-rtdb.firebaseio.com",
    projectId: "quiz-test-65611",
    storageBucket: "quiz-test-65611.appspot.com",
    messagingSenderId: "454184163292",
    appId: "1:454184163292:web:adad8c203f05cea2212119"
  };

  const app = initializeApp(firebaseConfig);

// обработчик событий, который отслеживает загрузку контента
document.addEventListener('DOMContentLoaded', function(){
    const btnOpenModal = document.querySelector('#btnOpenModal');
    const modalBlock = document.querySelector('#modalBlock');
    const closeModal = document.querySelector('#closeModal');
    const questonTitle = document.querySelector('#question');
    const formAnswers = document.querySelector('#formAnswers');
    const nextButton = document.querySelector('#next');
    const prevButton = document.querySelector('#prev');
    const sendButton = document.querySelector('#send');

    // функция получения данных
    const getData = () => {
        formAnswers.textContent = 'LOAD';

        const dbRef = ref(getDatabase());

        get(child(dbRef, 'questions')).then((snapshot) => {
            if (snapshot.exists()) {
                playTest(snapshot.val());
            } else {
                formAnswers.textContent = 'Ошибка загрузки данных!';
                console.error("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });

        /*setTimeout(() => {
            fetch('./questions.json')
                .then(res => res.json())
                .then(obj => playTest(obj.questions))
                .catch(err => {
                    formAnswers.textContent = 'Ошибка загрузки данных!'
                    console.error(err);
                });

        }, 1000);*/
    }

    // обработчики событий открытия/закрытия модального окна
    btnOpenModal.addEventListener('click', () => {
        modalBlock.classList.add('d-block');
        getData();
    });

    closeModal.addEventListener('click', () => {
        modalBlock.classList.remove('d-block');
    });

    // функция запуска тестирования
    const playTest = (questions) => {

        const finalAnswers = [];

        // переменная с номером вопроса
        let numberQuestion = 0;

        // функция рендеринга ответов
        const renderAnswers = (index) => {
            questions[index].answers.forEach((answer) => {
                const answerItem = document.createElement('div');

                answerItem.classList.add('answers-item', 'd-flex', 'justify-content-center');

                answerItem.innerHTML = `
                    <input type="${questions[index].type}" id="${answer.title}" name="answer" class="d-none" value="${answer.title}">
                    <label for="${answer.title}" class="d-flex flex-column justify-content-between">
                    <img class="answerImg" src="${answer.url}" alt="burger">
                    <span>${answer.title}</span>
                    </label>
                `;
                formAnswers.appendChild(answerItem);
            });
        }

        // фнкция рендеринга вопросов + ответов
        const renderQuestions = (indexQuestion) => {
            formAnswers.innerHTML = '';

            switch (true) {
                case numberQuestion === 0:
                    prevButton.classList.add('d-none');
                    break;
                case numberQuestion <= questions.length - 1:
                    prevButton.classList.remove('d-none');
                    nextButton.classList.remove('d-none');
                    sendButton.classList.add('d-none');
                    break;
                case numberQuestion === questions.length:
                    prevButton.classList.add('d-none');
                    nextButton.classList.add('d-none');
                    sendButton.classList.remove('d-none');
                    break;
                default: break;
            }

            if(numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
                questonTitle.textContent = `${questions[indexQuestion].question}`;
                renderAnswers(indexQuestion);
            }

            /*if(numberQuestion === 0) {
                prevButton.classList.add('d-none');
            }*/

            if(numberQuestion === questions.length) {
                nextButton.classList.add('d-none');
                prevButton.classList.add('d-none');
                sendButton.classList.remove('d-none');

                formAnswers.innerHTML = `
                    <div class="form-group">
                        <label for="numberPhone">Enter your number</label>
                        <input type="phone" class="form-control" id="numberPhone">
                    </div>
                `;
            }

            if(numberQuestion === questions.length + 1) {
                formAnswers.textContent = 'Спасибо за пройденный тест!';
                setTimeout(() => {
                    modalBlock.classList.remove('d-block');
                }, 2000);
            }

        } 

        // запуск функции рендеринга 
        renderQuestions(numberQuestion);  

        const checkAnswer = () => {
            const obj = {};
            const inputs = [...formAnswers.elements].filter((input) => input.checked || input.id === 'numberPhone')

            inputs.forEach((input, index) => {
               if(numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
                obj[`${index}_${questions[numberQuestion].question}`] = input.value;
               }

               if(numberQuestion === questions.length) {
                obj['Номер телефона'] = input.value;
               }
            });

            finalAnswers.push(obj);
        }

        // обработчики событий кнопок next и prev
        nextButton.onclick = () => {
            checkAnswer();
            numberQuestion++;
            renderQuestions(numberQuestion);
        }

        prevButton.onclick = () => {
            numberQuestion--;
            renderQuestions(numberQuestion);
        }

        sendButton.onclick = () => {
            checkAnswer();
            numberQuestion++;

            const contactsRef = ref(getDatabase(), 'contacts');

            push(ref(getDatabase(), 'contacts'), {
                ...finalAnswers
            });

            renderQuestions(numberQuestion);
            console.log(finalAnswers);
        }
    }

})