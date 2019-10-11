'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const keyboardButton = document.querySelector('.search-form__keyboard');
    const keyboard = document.querySelector('.keyboard');
    const closeKeyboard = document.getElementById('close-keyboard');
    const searchInput = document.querySelector('.search-form__input');

    const toggleKeyboard = () => {
        keyboard.style.top = keyboard.style.top ? '' : keyboard.style.top = '50%';
    };

    const changeLang = (buttons, lang) => {
        const langRu = ['ё', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '-', '=', '⬅',
            'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ',
            'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э',
            'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.',
            'en', ' '];
        const langEn = ['`', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '-', '=', '⬅',
            'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']',
            'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '"',
            'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',
            'ru', ' '];

        if (lang === 'en') {
            buttons.forEach((btn, i) => {
                btn.textContent = langEn[i];
            })
        } else {
            buttons.forEach((btn, i) => {
                btn.textContent = langRu[i];
            })
        }
    };

    const typing = event => {
        const target = event.target;
        if (target.tagName.toLocaleLowerCase() === 'button') {
            const buttons = [...keyboard.querySelectorAll('button')]
                .filter(elem => elem.style.visibility !== 'hidden');
            const contentButton = target.textContent.trim();
            if (contentButton === '⬅') {
                searchInput.value = searchInput.value.slice(0, searchInput.value.length - 1);
            } else if (!contentButton) {
                searchInput.value += ' ';
            } else if (contentButton === 'en' || contentButton === 'ru') {
                changeLang(buttons, contentButton);
            } else {
                searchInput.value += contentButton;
            }
        }
    };

    keyboardButton.addEventListener('click', toggleKeyboard);
    closeKeyboard.addEventListener('click', toggleKeyboard);
    keyboard.addEventListener('click', typing);

    //Меню

    const burger = document.querySelector('.spinner');
    const sidebarMenu = document.querySelector('.sidebarMenu');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        sidebarMenu.classList.toggle('rollUp');
    });

    sidebarMenu.addEventListener('click', e => {
        let target = e.target;
        target = target.closest('a[href = "#"]');

        if (target) {
            const parentTarget = target.parentElement;
            sidebarMenu.querySelectorAll('li').forEach(elem => {
                if (elem === parentTarget) {
                    elem.classList.add('active');
                } else {
                    elem.classList.remove('active');
                }
            })
        }
    });

    // Обработчик появления модалки при клике
    const modalAppear = () => {
        const videoItems = document.querySelectorAll('[data-youtuber]');
        const youTubeModal = document.querySelector('.youTuberModal');
        const modalContainer = document.getElementById('youtuberContainer');

        const qw = [3840, 2560, 1920, 1280, 854, 640, 426, 256];
        const qh = [2160, 1440, 1080, 720, 480, 360, 240, 144];

        const sizeVideo = () => {
            let ww = document.documentElement.clientWidth;
            let wh = document.documentElement.clientHeight;
            for (let i = 0; i < qw.length; i++) {
                if (ww > qw[i]) {
                    modalContainer.querySelector('iframe').style.cssText = `
                        width: ${qw[i]}px;
                        height: ${qh[i]}px;
                    `;
                    modalContainer.style.cssText = `
                         width: ${qw[i]}px;
                         height: ${qh[i]}px;
                         top: ${(wh - qh[i]) / 2}px;
                         left:${(ww - qw[i]) / 2}px;   
                     `;
                    break;
                }
            }
        };

        videoItems.forEach(elem => {
            elem.addEventListener('click', () => {
                const idVideo = elem.dataset.youtuber;
                youTubeModal.style.display = 'block';

                const youTubeFrame = document.createElement('iframe');
                youTubeFrame.src = `https://youtube.com/embed/${idVideo}`;
                modalContainer.insertAdjacentElement('beforeend', youTubeFrame);

                window.addEventListener('resize', sizeVideo);

                sizeVideo();
            })
        });
        youTubeModal.addEventListener('click', () => {
            youTubeModal.style.display = '';
            modalContainer.innerHTML = '';
            window.removeEventListener('resize', sizeVideo);
        });
    };

    // Модальное окно
    {
        document.body.insertAdjacentHTML('beforeend',
            `<div class="youTuberModal">
                    <div id="youtuberClose">&#215;</div>
                    <div id="youtuberContainer"></div>
                   </div>
                   `);
        modalAppear();
    }

    //API
    {
        const API_KEY = 'AIzaSyCQlbkqSCYFWYzcKhBt19Rb2g9zk_fKPwo';
        const CLIENT_ID = '535986209726-b5knodgtaop3culgi905blm1j34jc945.apps.googleusercontent.com';


        //Авторизация
        {
            const buttonAuth = document.getElementById('authorize');
            const authBlock = document.querySelector('.auth');

            const authenticate = () => gapi.auth2.getAuthInstance()
                .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
                .then(() => console.log("Sign-in successful"))
                .catch(errorAuth);

            const loadClient = () => {
                gapi.client.setApiKey(API_KEY);
                return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
                    .then(() => console.log("GAPI client loaded for API"))
                    .then(() => {
                        authBlock.style.display = 'none'
                    })
                    .catch(errorAuth)
            };

            gapi.load("client:auth2", function () {
                gapi.auth2.init({client_id: CLIENT_ID});
            });

            buttonAuth.addEventListener('click', () => {
                authenticate().then(loadClient)
            });

            const errorAuth = err => {
                console.error(err);
                authBlock.style.display = '';
            };
        }

        //Request
        {
            const gloTube = document.querySelector('.logo-academy');
            const trends = document.getElementById('yt_trend');
            const like = document.getElementById('like');
            const subscriptions = document.getElementById('subscriptions');
            const searchForm = document.querySelector('.search-form');

            const request = options => gapi.client.youtube[options.method]
                .list(options)
                .then(response => response.result.items)
                .then(data => options.method === 'subscriptions' ? subRender(data) : render(data))
                .catch(err => console.error('Во время запроса произошла ошибка: ' + err));

            const render = data => {
                console.log(data);
                const ytWrapper = document.getElementById('yt-wrapper');
                ytWrapper.textContent = '';
                data.forEach(item => {
                    try {const {
                        id,
                        id: {
                            videoId
                        },
                        snippet: {
                            channelTitle,
                            title,
                            resourceId: {
                                videoId: likedVideoId
                            } = {},
                            thumbnails: {
                                high: {
                                    url
                                }
                            }
                        }
                    } = item;
                    ytWrapper.innerHTML += `
                        <div class="yt" data-youtuber=${likedVideoId || videoId || id}>
                            <div class="yt-thumbnail" style="--aspect-ratio:16/9;">
                                <img src=${url} alt="thumbnail" class="yt-thumbnail__img">
                            </div>
                            <div class="yt-title">${title}</div>
                            <div class="yt-channel">${channelTitle}</div>
                        </div>
                    `;
                    } catch (err) {
                        console.error(err);
                    }
                });
                modalAppear();
            };

            const subRender = data => {
                console.log(data);
                const ytWrapper = document.getElementById('yt-wrapper');
                ytWrapper.textContent = '';
                data.forEach(item => {
                   try {const {
                        snippet: {
                            resourceId: {
                                channelId
                            },
                            description,
                            title,
                            thumbnails: {
                                high: {
                                    url
                                }
                            }
                        }
                    } = item;
                    ytWrapper.innerHTML += `
                        <div class="yt" data-youtuber=${channelId}>
                            <div class="yt-thumbnail" style="--aspect-ratio:16/9;">
                                <img src=${url} alt="thumbnail" class="yt-thumbnail__img">
                            </div>
                            <div class="yt-title">${title}</div>
                            <div class="yt-channel">${description}</div>
                        </div>
                    `;
                    } catch (err) {
                       console.error(err);
                   }
                });

                ytWrapper.querySelectorAll('.yt').forEach(item => {
                    item.addEventListener('click', () => {
                        request({
                            method: 'search',
                            part: 'snippet',
                            channelId: item.dataset.youtuber,
                            order: 'date',
                            maxResults: 6,
                        });
                    })
                })
            };

            gloTube.addEventListener('click', () => {
                request({
                    method: 'search',
                    part: 'snippet',
                    channelId: 'UCVswRUcKC-M35RzgPRv8qUg',
                    order: 'date',
                    maxResults: 6,
                });
            });

            trends.addEventListener('click', () => {
                request({
                    method: 'videos',
                    part: 'snippet',
                    chart: 'mostPopular',
                    maxResults: 6,
                    regionCode: 'RU'
                })
            });

            like.addEventListener('click', () => {
                request({
                    method: 'playlistItems',
                    part: 'snippet',
                    playlistId: 'LLhsHgN-KcHikNHGcwi2frlQ',
                    maxResults: 6,
                })
            });

            subscriptions.addEventListener('click', () => {
                request({
                    method: 'subscriptions',
                    part: 'snippet',
                    mine: true,
                    maxResults: 6,
                })
            });

            searchForm.addEventListener('submit', (event) => {
                console.log('submit');
                event.preventDefault();
                const valueInput = searchForm.elements[0].value;

                if (!valueInput) {
                    searchForm.style.border = '1px solid red';
                    return;
                }
                request({
                    method: 'search',
                    part: 'snippet',
                    order: 'relevance',
                    maxResults: 6,
                    q: valueInput,
                });
                searchForm.elements[0].value = '';
            })
        }
    }
});
