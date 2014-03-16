/*jslint browser: true*/
(function (spoker) {
    'use strict';

    var SHOW_CARD_IN_BIG_CLASS_NAME = 'show-in-big',
        CARD_CLASS_NAME = 'card',
        BIG_CARD_CLASS_NAME = 'big-card',
        SMALL_CARD_CLASS_NAME = 'small-card',
        FRONT_CARD_CLASS_NAME = 'front',
        BACK_CARD_CLASS_NAME = 'back',
        CARD_SIDE_CLASS_NAME = 'card-side',
        DOM_EVENTS = {
            CLICK: 'click',
            TOUCHEND: 'touchend',
            TOUCHMOVE: 'touchmove',
            TOUCHSTART: 'touchstart'
        },
        CARD_TYPES = {
            FIBONACI:'fibonacci',
            STANDARD: 'standard',
            TSHIRT: 'tshirt'
        },
        showing = false,
        placeClickEnabled = true,
        body,
        place;

    function byId(id) {
        return document.getElementById(id);
    }

    function listen(elem, event, cb) {
        elem.addEventListener(event, cb, false);
    }

    function onClick(elem, cb) {
        if (typeof elem === 'string') {
            elem = byId(elem);
        }
        listen(elem, DOM_EVENTS.CLICK, cb);
    }

    /*
    function onTouchEnd(elem, cb) {
        if (typeof elem === 'string') {
            elem = byId(elem);
        }
        listen(elem, DOM_EVENTS.TOUCHEND, cb);
    }
    */

    /*jslint eqeq: true*/
    function truthy(elem) {
        return elem != null;
    }
    /*jslint eqeq: false*/

    function hideDisplayedCard() {
        body.classList.remove(SHOW_CARD_IN_BIG_CLASS_NAME);
    }

    function setData(element) {
        function setElementData(name, value) {
            if (element.dataset) {
                element.dataset[name] = value;
            } else {
                element.setAttribute('data-' + name, value);
            }
        }

        return function (data) {
            setElementData.apply(element, data);
        };
    }

    function setAttributes(element) {
        return function (attrib) {
            element.setAttribute.apply(element, attrib);
        };
    }

    function fibonacci(test, acc) {
        var val;

        if (acc.length < 2) {
            val = 1;
        } else {
            val = acc[acc.length - 2] + acc[acc.length - 1];
        }

        if (test(val)) {
            acc.push(val);

            return fibonacci(test, acc);
        }

        return acc;
    }

    function processDisplayedValue(value) {
        if (+value === 0.5) {
            value = '1/2';
        } else if (value === 'coffe') {
            value = '<img src="images/CoffeeCup.svg" alt="coffee" />';
        } else if (+value === Infinity) {
            value = '&#8734;';
        }
        return String(value);
    }

    function createElement(name, classes, data, attributes, text) {
        var element = document.createElement(name);

        classes.forEach(function (cn) {
            element.classList.add(cn);
        });
        data.forEach(setData(element));
        attributes.forEach(setAttributes(element));

        if (truthy(text)) {
            element.innerHTML = text;
        }

        return element;
    }

    function createDiv(classes, data, attributes, text) {
        return createElement('div', classes, data, attributes, text);
    }

    function createCardSide(element, which, text) {
        var cardSide = createDiv([CARD_SIDE_CLASS_NAME, which], [], [], text);
        element.appendChild(cardSide);
    }

    function createCard(value) {
        var card = createDiv([CARD_CLASS_NAME, SMALL_CARD_CLASS_NAME], [['value', value]], []);

        createCardSide(card, FRONT_CARD_CLASS_NAME, processDisplayedValue(value));
        createCardSide(card, BACK_CARD_CLASS_NAME);

        return card;
    }

    function toArray(args) {
        return Array.prototype.slice.call(args);
    }

    function removeCard(card) {
        place.removeChild(card);
    }

    function removeCards() {
        var cards = toArray(place.querySelectorAll('.' + CARD_CLASS_NAME + ':not(.' + BIG_CARD_CLASS_NAME + ')'));

        cards.forEach(removeCard);
    }

    function addCards(cards) {
        var fragment = document.createDocumentFragment();

        cards.forEach(function (val) {
            fragment.appendChild(createCard(val));
        });

        place.appendChild(fragment);
    }

    function cardChangeDisabled() {
        return showing || !placeClickEnabled;
    }

    function getFibonacciCards() {
        return fibonacci(function (last) {
            return last < 100; // generate fibonacci until last item is less then 100
        }, [0]).reduce(function (prev, current, index, array) {
            var arr = prev || [prev];

            if (arr.indexOf(current) === -1) {
                return arr.concat(current);
            }

            return arr;
        }, ['?', 0.5]);
    }

    function getStandardCards() {
        return ['coffe', '?', 0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, Infinity];
    }

    function getTshirtCards() {
        return ['XS', 'S', 'M', 'L', 'XL', 'XL', '?'];
    }

    function setActiveCardTypeButton(type) {
        var toolbar = byId('Toolbar');
        if (type === CARD_TYPES.STANDARD) {
            toolbar.classList.add('active-standard');
        } else {
            toolbar.classList.remove('active-standard');
        }

        if (type === CARD_TYPES.TSHIRT) {
            toolbar.classList.add('active-tshirt');
        } else {
            toolbar.classList.remove('active-tshirt');
        }

        if (type === CARD_TYPES.FIBONACI) {
            toolbar.classList.add('active-fibonacci');
        } else {
            toolbar.classList.remove('active-fibonacci');
        }
    }

    function getCards(type) {
        var cards;

        if (type === CARD_TYPES.FIBONACI) {
            cards = getFibonacciCards();
        } else if (type === CARD_TYPES.TSHIRT) {
            cards = getTshirtCards();
        } else {
            cards = getStandardCards();
        }

        return cards;
    }

    function getSelectCardCb(type) {
        return function () {
            if (cardChangeDisabled()) {
                return;
            }
            removeCards();
            addCards(getCards(type));
            setActiveCardTypeButton(type);
        };
    }

    listen(window, 'load', function () {
        var cardTypeSelector, cardsPlace, cardTypeController;
        place = byId('PokerPlace');
        body = document.getElementsByTagName('body')[0];

        removeCards();
        addCards(getStandardCards());

        cardsPlace = spoker.CardsPlace();
        cardsPlace.setupPlaceClickEnabler();

        spoker.PlaceController({
            view: cardsPlace
        }).listenViewEvents();

        cardTypeSelector = spoker.CardTypeSelectorView();
        cardTypeSelector.setupCardTypeSelector();

        cardTypeController = spoker.Controller({
            view: cardTypeSelector,
            viewEvents: {
                'standardSelected': getSelectCardCb(CARD_TYPES.STANDARD),
                'fibonacciSelected': getSelectCardCb(CARD_TYPES.FIBONACI),
                'tshirtSelected': getSelectCardCb(CARD_TYPES.TSHIRT)
            }
        });

        cardTypeController.listenViewEvents();

        onClick('DisplayedCard', hideDisplayedCard);
    }, false);
}(window.spoker = window.spoker || {}));
