const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const fs = require('fs');

const notifier = require('node-notifier');

const opn = require('opn');

var offers = new Array();

const url = 'https://www.olx.pt/tecnologia-e-informatica/computadores-informatica/portateis/q-dell-xps-15/?search%5Bdescription%5D=1';
const fileName = url.substr(url.indexOf('/q-') + 3, url.indexOf('/?') - url.indexOf('/q-') - 3) + ".offer";
const secondsToUpdate = 10;

function retrieveOffers() {
    
    JSDOM.fromURL(url).then(dom => {
        const liveOffers = new Array();
        const liveOffersDOM = dom.window.document.querySelectorAll('.link.detailsLink');

        for(const offer of liveOffersDOM) {            
            if(offer && offer.textContent && offer.baseURI) {
                liveOffers.push(offer.textContent.trim() + ' - ' + offer.baseURI);
            }
        }
        areThereNewOffers(liveOffers);
    });

    setTimeout(retrieveOffers, secondsToUpdate*1000);
}

function loadOffers() {
    if(fs.existsSync(fileName)) {
        fs.readFile(fileName, (error, data) => {
            if(error) {
                return console.log(error);
            }
            offers = data.toString().split('\n');
        });
    }
}

function areThereNewOffers(liveOffers) {
    
    const newOffers = liveOffers.filter(offer => offers.indexOf(offer) < 0);
    
    if(newOffers.length > 0) {
        console.log('\n\n\n\n');
        console.log('============ YOU HAVE NEW OFFERS ============\n');
        console.log('\n');
        for(offer of newOffers) {
            
            notifier.notify({
                title: 'OLX - NEW ITEM!!',
                message: offer.split(' - https')[0],
                open: 'https://' + offer.split('https://')[1],
                sound: true,
                wait: true
            });

            opn('https://' + offer.split('https://')[1]);

            console.log(offer);
            fs.appendFile(fileName, offer + '\n', error => {
                if(error) {
                    return console.log(error);
                }
            });
        }
        console.log('\n\n\n\n');
    }

    offers = offers.concat(newOffers);
}

loadOffers();
retrieveOffers();