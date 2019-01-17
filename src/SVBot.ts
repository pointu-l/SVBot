import { exec } from "child_process";
import moment from "moment";
import {HourObject, InitObject} from "hours-objects";

class SVBot
{
    private timer: any = null;
    private next: any;
    private morningHour: HourObject;
    private lunchHour: HourObject;
    private afternoonHour: HourObject;
    private endOfDayHour: HourObject;

    /**
     * *Hour var format eg : 12:00
     * @param  initObj
     */
    constructor(initObj: InitObject)
    {
        /**
         * @type { string[] }
         */
        let tmp = null;

        tmp = initObj.morningHour.split(":");
        this.morningHour = { h: +tmp[0], m: +tmp[1] };

        tmp = initObj.lunchHour.split(":");
        this.lunchHour = { h: +tmp[0], m: +tmp[1] };

        tmp = initObj.afternoonHour.split(":");
        this.afternoonHour = { h: +tmp[0], m: +tmp[1] };

        tmp = initObj.endOfDayHour.split(":");
        this.endOfDayHour = { h: +tmp[0], m: +tmp[1] };
    }

    /**
     * @private
     */
    refreshTimeout(now: Date)
    {
        const mNext: moment.Moment = moment(new Date(), "DD/MM/YYYY HH:mm:ss")
            .add(30, 'm')
        ;
        const next: Date = mNext.toDate();
        this.next = { };
        this.next.h = next.getHours();
        this.next.h = next.getMinutes();

        const ms: number = moment(now,"DD/MM/YYYY HH:mm:ss").diff(next, "ms", true) * -1;
        clearTimeout(this.timer);
        console.info("Période de log détectée")
        var tempTime = moment.duration(ms, 'milliseconds');
        var y = tempTime.hours() + ":" + tempTime.minutes() + ":" + tempTime.seconds();

        console.log(` Dans : ${y}`);
        const future: Date = moment(now).clone().add(ms, "ms").toDate();
        console.log(` Soit à : ${ future.getHours() }:${ future.getMinutes() }:${ future.getSeconds() } `);
        this.timer = setTimeout(() => {
            console.log("alerte")
            this.init();
        }, ms);
        return;
    }

    /**
     * @private
     */
    setTimeout()
    {
        const now: Date = new Date();
        const nowMoment: moment.Moment = moment(now);

        const currentHour: number = now.getHours();
        const currentMins: number = now.getMinutes();

        if (this.next)
        {
            if (this.next.h === currentHour && this.next.m === currentMins)
            {
                return this.refreshTimeout(now);
            }
        }
        // heures de log

        if ((currentHour > this.morningHour.h && currentHour < this.lunchHour.h)
            || (currentHour > this.afternoonHour.h && currentHour < this.endOfDayHour.h))
        {
            return this.refreshTimeout(now);
        }

        if (currentHour == this.morningHour.h)
        {
            return this.refreshTimeout(now);
        }

        if (currentHour == this.lunchHour.h && currentMins === 0)
        {
            return this.refreshTimeout(now);
        }

        if (currentHour == this.afternoonHour.h)
        {
            return this.refreshTimeout(now);
        }

        if (currentHour == this.endOfDayHour.h && currentMins === 0)
        {
            return this.refreshTimeout(now);
        }
        // On calcule la diff heures & mins
        if (currentHour < this.morningHour.h )
        {
            // Tôt le matin ou tard le soir
            const mNext: moment.Moment = moment(new Date(), "DD/MM/YYYY HH:mm:ss")
                .hours(this.morningHour.h)
                .minutes(this.morningHour.m);
            const next: Date = mNext.toDate();
            const ms: number = moment(now,"DD/MM/YYYY HH:mm:ss").diff(next, "ms", true) * -1;
            console.log(ms);
            clearTimeout(this.timer);

            console.info("Hors heures bureau");
            var tempTime = moment.duration(ms, 'milliseconds');
            var y = tempTime.hours() + ":" + tempTime.minutes() + ":" + tempTime.seconds();

            console.log(` Dans : ${y}`);
            const future: Date = nowMoment.clone().add(ms, "ms").toDate();
            console.log(` Soit à : ${ future.getHours() }:${ future.getMinutes() }:${ future.getSeconds() } `);

            this.timer = setTimeout(() => {
                this.init();
            }, ms);
            return;
        }

        if (currentHour >= this.lunchHour.h && currentHour < this.afternoonHour.h)
        {
            // Pause dej
            const mNext: moment.Moment = moment(new Date(), "DD/MM/YYYY HH:mm:ss")
                .hours(this.afternoonHour.h)
                .minutes(this.afternoonHour.m);
            const next: Date = mNext.toDate();
            now.setMilliseconds(0);
            const ms: number = moment(now,"DD/MM/YYYY HH:mm:ss").diff(next, "ms", true) * -1;
            console.log(ms);
            clearTimeout(this.timer);
            console.info("Pause dej");
            var tempTime = moment.duration(ms, 'milliseconds');
            var y = tempTime.hours() + ":" + tempTime.minutes() + ":" + tempTime.seconds();

            console.log(` Dans : ${y}`);
            const future: Date = nowMoment.clone().add(ms, "ms").toDate();
            console.log(` Soit à : ${ future.getHours() }:${ future.getMinutes() }:${ future.getSeconds() } `);
            this.timer = setTimeout(() => {
                this.init();
            }, ms);
            return;
        }
    }

    /**
     * @public
     */
    init()
    {
        let dir;
        dir = exec("svn up", (err: any, stdout: string, stderr: any) => {
            let date: Date = new Date();
            console.info("[UP] " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
            console.info(stdout);
            if (err) {
                console.info("[ERROR]");
                console.info(stderr);
            }
            this.setTimeout();
        });

        /* dir.on('exit', (code: any) => {
            console.error(code);
        }); */
    }
}

export default SVBot;