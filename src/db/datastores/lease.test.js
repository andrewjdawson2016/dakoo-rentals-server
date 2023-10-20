const { getLeaseEvents } = require('./lease');

describe('getLeaseEvents', () => {

    it('should return only start and end events for leases of 2 months or less', () => {
        const events = getLeaseEvents('2022-01-01', '2022-02-28');
        expect(events).toEqual([
            { date: '2022-01-01', description: 'start of lease' },
            { date: '2022-02-28', description: 'end of lease' }
        ]);
    });

    it('should include 2 months and 1 month reminders for leases longer than 2 months but less or equal to 6 months', () => {
        const events = getLeaseEvents('2022-01-01', '2022-06-30');
        expect(events).toEqual([
            { date: '2022-01-01', description: 'start of lease' },
            { date: '2022-06-30', description: 'end of lease' },
            { date: '2022-04-30', description: 'send two month reminder' },
            { date: '2022-05-30', description: 'renewal deadline' }
        ]);
    });

    it('should include all reminders for leases longer than 6 months', () => {
        const events = getLeaseEvents('2022-01-01', '2022-12-31');
        expect(events).toEqual([
            { date: '2022-01-01', description: 'start of lease' },
            { date: '2022-12-31', description: 'end of lease' },
            { date: '2022-10-31', description: 'send two month reminder' },
            { date: '2022-11-30', description: 'renewal deadline' },
            { date: '2022-06-30', description: 'send six month renewal option' }
        ]);
    });
});

