import {exec} from "child_process";
import moment from "moment";
import {HourObject, InitObject} from "hours-objects";

class SVBot {
    private timer: any = null;
    private morningHour: HourObject;
    private lunchHour: HourObject;
    private afternoonHour: HourObject;
    private endOfDayHour: HourObject;

    /**
     * Hour const format eg : 12:00
     */
    public constructor(initObj: InitObject)
    {
        let tmp: String[];

        tmp = initObj.morningHour.split(":");
        this.morningHour = {h: +tmp[0], m: +tmp[1]};

        tmp = initObj.lunchHour.split(":");
        this.lunchHour = {h: +tmp[0], m: +tmp[1]};

        tmp = initObj.afternoonHour.split(":");
        this.afternoonHour = {h: +tmp[0], m: +tmp[1]};

        tmp = initObj.endOfDayHour.split(":");
        this.endOfDayHour = {h: +tmp[0], m: +tmp[1]};
    }

    private zero(n: number) { (n < 10 ? '0' : '') + n }

    private refreshTimeout(now: Date) {
        const mNext: moment.Moment = moment(new Date(), "DD/MM/YYYY HH:mm:ss")
            .add(30, 'm')
        ;
        const next: Date = mNext.toDate();
        const ms: number = moment(now, "DD/MM/YYYY HH:mm:ss").diff(next, "ms", true) * -1;
        const tempTime = moment.duration(ms, 'milliseconds');
        const y = this.zero(tempTime.hours()) + ":" + this.zero(tempTime.minutes()) + ":" + this.zero(tempTime.seconds());

        console.log(` Dans : ${y}`);
        const future: Date = moment(now).clone().add(ms, "ms").toDate();
        console.log(` Soit : ${this.zero(future.getHours())}:${this.zero(future.getMinutes())}:${this.zero(future.getSeconds())} `);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => { this.init() }, ms);
        return;
    }

    /**
     * @private
     */
    setTimeout() {
        const now: Date = new Date();
        const nowMoment: moment.Moment = moment(now);

        const currentHour: number = now.getHours();
        const currentMins: number = now.getMinutes();

        const nextDuration: moment.Duration = moment.duration(30, "minutes");
        const nextDate: Date = moment(new Date(), "DD/MM/YYYY HH:mm:ss").add(nextDuration, "minutes").toDate();

        // On calcule la diff heures & mins
        if (currentHour < this.morningHour.h) {
            /*
             * Matin avant heures actives.
             * Si le script fonctionne bien et est lancé le matin, cette condition ne s'executera que cette fois.
             * SVbot se met en pause de la fin des horaires actives jusqu'au début des horaires actives
             * du prochain jour actif
             */
            const mNext: moment.Moment = moment(new Date(), "DD/MM/YYYY HH:mm:ss")
                .hours(this.morningHour.h)
                .minutes(this.morningHour.m)
                .seconds(0)
            ;
            const next: Date = mNext.toDate();
            let ms: number = moment(now, "DD/MM/YYYY HH:mm:ss").diff(next, "ms", true);
            if (ms < 0) {
                ms *= -1;
            }
            clearTimeout(this.timer);

            console.info("SVBot part de chez lui.");
            const tempTime = moment.duration(ms, 'milliseconds');
            const y = this.zero(tempTime.hours()) + ":" + this.zero(tempTime.minutes()) + ":" + this.zero(tempTime.seconds());

            console.log(` Il commence dans : ${y}`);
            const future: Date = nowMoment.clone().add(ms, "ms").toDate();
            console.log(` Soit à : ${this.zero(future.getHours())}:${this.zero(future.getMinutes())}:${this.zero(future.getSeconds())} `);

            this.timer = setTimeout(() => {
                this.init();
            }, ms);
            return;
        }

        if (currentHour > this.endOfDayHour.h || (currentHour == this.endOfDayHour.h && currentMins > 0)) {
            // Soir après les heures actives
            const mNext: moment.Moment = moment(new Date(), "DD/MM/YYYY HH:mm:ss")
                .add(1, 'd')
                .hours(this.morningHour.h)
                .minutes(this.morningHour.m)
                .seconds(0)
            ;
            const next: Date = mNext.toDate();
            let ms: number = moment(now, "DD/MM/YYYY HH:mm:ss").diff(next, "ms", true);
            if (ms < 0) {
                ms *= -1;
            }
            clearTimeout(this.timer);

            console.info("SVBot rentre chez lui.");
            const tempTime = moment.duration(ms, 'milliseconds');
            const y = this.zero(tempTime.hours()) + ":" + this.zero(tempTime.minutes()) + ":" + this.zero(tempTime.seconds());

            console.log(` Retour dans : ${y}`);
            const future: Date = nowMoment.clone().add(ms, "ms").toDate();
            console.log(` Soit demain à : ${this.zero(future.getHours())}:${this.zero(future.getMinutes())}:${this.zero(future.getSeconds())} `);

            this.timer = setTimeout(() => {
                this.init();
            }, ms);
            return;
        }

        if ((currentHour >= this.lunchHour.h && currentHour < this.afternoonHour.h) || (nextDate.getHours() >= this.lunchHour.h && nextDate.getHours() < this.afternoonHour.h)) {
            // Pause dej
            const mNext: moment.Moment = moment(new Date(), "DD/MM/YYYY HH:mm:ss")
                .hours(this.afternoonHour.h)
                .minutes(this.afternoonHour.m)
                .seconds(0);
            const next: Date = mNext.toDate();
            const ms: number = moment(now, "DD/MM/YYYY HH:mm:ss").diff(next, "ms", true) * -1;
            clearTimeout(this.timer);
            console.info("SVBot part en pause dejeuner.");
            const tempTime = moment.duration(ms, 'milliseconds');
            const y = this.zero(tempTime.hours()) + ":" + this.zero(tempTime.minutes()) + ":" + this.zero(tempTime.seconds());

            console.log(` Il en a pour : ${y}`);
            const future: Date = nowMoment.clone().add(ms, "ms").toDate();
            console.log(` Il revient donc à : ${this.zero(future.getHours())}:${this.zero(future.getMinutes())}:${this.zero(future.getSeconds())} `);
            this.timer = setTimeout(() => {
                this.init();
            }, ms);
            return;
        }

        // Heures de log
        return this.refreshTimeout(now);
    }

    public init() {
        exec("svn up", (err: any, stdout: string, stderr: any) => {
            let date: Date = new Date();
            console.info("---------- " + this.zero(date.getHours()) + ":" + this.zero(date.getMinutes()) + ":" + this.zero(date.getSeconds()) + " ----------")
            console.info(stdout);
            if (err) {
                console.error("!!! Erreur SVN !!!");
                console.error(stderr);
                console.error("Le programme va s'arreter ...");
                return 0;
            }

            console.info("Recherche des heures actives ...");
            this.setTimeout();
        });
    }
}

export default SVBot;
