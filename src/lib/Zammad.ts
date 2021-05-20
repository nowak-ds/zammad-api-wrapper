import axios, { AxiosInstance } from "axios";

export module Zammad {
	export class API {
		constructor(address: string) {
			this.__baseURL = address;
		}
		
		private __baseURL: string;
		private __axiosInst: AxiosInstance;
		private __curUser: IUser | undefined;
		private __curUsers: IUser[] | undefined;
		private __curOrganizations: IOrganization[] | undefined;
		private __curTicketArticles: ITicketArticle[] | undefined;

		public setAuthHeader(bearerToken: string) {
			if (!bearerToken) { throw new Error("Token can not be null") }
			this.__axiosInst = axios.create({
				baseURL: this.__baseURL,
				headers: {
					authorization: bearerToken
				}
			})
		}

		public getTickets(conditions?: IConditions) {
			return new Promise<ITicket[]>((resolve, reject) => {
				this.__axiosInst.get<ITicket[]>('tickets').then((value) => {
					value.data.forEach(r => API.__convertTimes(r));
					let allTickets = value.data;

					if (conditions == null || Object.keys(conditions).length <= 0) {
						resolve(allTickets);
						return;
					} else {
						this.__filterTickets(allTickets, conditions).then((tickets) => {
							resolve(tickets);
						}).catch(reason => console.log({ msg: 'Filtering of tickets failed!', reason: reason }));
					}

				}).catch(reason => reject({ msg: `Getting tickets failed!`, reason: reason }));;
			});
		}

		private __getUsers() {
			return new Promise<IUser[]>((resolve, reject) => {
				this.__axiosInst.get<IUser[]>('users').then((value) => {
					value.data.forEach(r => API.__convertTimes(r));
					resolve(value.data);
				}).catch(reason => reject({ msg: `Getting users failed!`, reason: reason }));;
			});
		}

		private __getCurrentUser() {
			return new Promise<IUser>((resolve, reject) => {
				this.__axiosInst.get<IUser>('users/me').then((value) => {
					API.__convertTimes(value.data);
					resolve(value.data);
				}).catch(reason => reject({ msg: `Getting current user failed!`, reason: reason }));
			});
		}

		private __getOrganizations() {
			return new Promise<IOrganization[]>((resolve, reject) => {
				this.__axiosInst.get<IOrganization[]>('organizations').then((value) => {
					value.data.forEach(r => API.__convertTimes(r));
					resolve(value.data);
				}).catch(reason => reject({ msg: `Getting organizations failed!`, reason: reason }));;
			});
		}

		private __getTicketArticles() {
			return new Promise<ITicketArticle[]>((resolve, reject) => {
				this.__axiosInst.get<ITicketArticle[]>('ticket_articles').then((value) => {
					value.data.forEach(r => API.__convertTimes(r));
					resolve(value.data);
				}).catch(reason => reject({ msg: `Getting ticket articles failed!`, reason: reason }));;
			});
		}

		private __filterTickets(allTickets: ITicket[], conditions: IConditions) {
			return new Promise<ITicket[]>((resolve, reject) => {

				this.__getUsers().then((users) => {
					this.__curUsers = users;
					this.__getCurrentUser().then((user) => {
						this.__curUser = user;
						this.__getOrganizations().then((organizations) => {
							this.__curOrganizations = organizations;
							this.__getTicketArticles().then((ticketArticles) => {
								this.__curTicketArticles = ticketArticles;
								let tickets: ITicket[] = [];

								for (let i = 0; i < allTickets.length; i++) {
									let add = true;
									for (let key in conditions) {
										if (!this.__ticketMatchesCondition(allTickets[i], key, conditions[key])) {
											add = false;
											break;
										}
									}
									if (add)
										tickets.push(allTickets[i]);
								}
								resolve(tickets);
							});
						});
					});
				});
			});
		}

		private __ticketMatchesCondition(ticket: ITicket, conditionKey: string, condition: ICondition) {
			let keys = conditionKey.split('.');

			switch (keys[0]) {
				case 'ticket':
					let ticketVal = ticket[keys[1]];

					if (ticketVal == null) {
						console.log(`Value '${keys[1]}' of ticket was not set.`);
						return false;
					}
					
					return this.__compareCondition(condition, ticketVal);
				case 'article':
					if (this.__curTicketArticles == null) {
						console.log('Checking if ticket matches conditions is only possible after getting ticket articles');
						return false;
					}
					for (let i = 0; i < this.__curTicketArticles.length; i++) {
						let ticketArticleValue = this.__curTicketArticles[i][keys[1]];

						if (ticketArticleValue == null) {
							console.log(`Value '${keys[1]}' of customer was not set.`);
							return false;
						}

						if (this.__compareCondition(condition, ticketArticleValue) && ticket.id === this.__curTicketArticles[i].ticket_id)
							return true;
					}
					break;
				case 'customer':
					if (this.__curUsers == null) {
						console.log('Checking if ticket matches conditions is only possible after getting users');
						return false;
					}
					for (let i = 0; i < this.__curUsers.length; i++) {
						let customerVal = this.__curUsers[i][keys[1]];

						if (customerVal == null) {
							console.log(`Value '${keys[1]}' of customer was not set.`);
							return false;
						}

						if (this.__compareCondition(condition, customerVal) && ticket.customer_id === this.__curUsers[i].id)
							return true;
					}
					break;
				case 'organization':
					if (this.__curOrganizations == null) {
						console.log('Checking if ticket matches conditions is only possible after getting organizations');
						return false;
					}
					for (let i = 0; i < this.__curOrganizations.length; i++) {
						let orgainzationVal = this.__curOrganizations[i][keys[1]];

						if (orgainzationVal == null) {
							console.log(`Value '${keys[1]}' of organization was not set.`);
							return false;
						}

						if (this.__compareCondition(condition, orgainzationVal) && ticket.organization_id === this.__curOrganizations[i].id)
							return true;
					}
					break;
			}
			return false;
		}

		private __compareCondition(condition: ICondition, val: any) {
			switch (condition.operator) {
				case ConditionOperator.contains:
					if (String(val).toLowerCase().indexOf(condition.value.toLowerCase()) > -1)
						return true;
					break;
				case ConditionOperator.containsNot:
					if (String(val).toLowerCase().indexOf(condition.value.toLowerCase()) <= -1)
						return true;
					break;
				case ConditionOperator.is:
				case ConditionOperator.isNot:
					switch (condition.pre_condition) {
						case PreCondition.currentUserId:
							condition.value = this.__curUser.id.toString();
							break;
						case PreCondition.currentUserOrganization:
							condition.value = this.__curUser.organization_ids.toString();
					}
					if (condition.pre_condition === PreCondition.currentUserId || condition.pre_condition === PreCondition.currentUserOrganization) {

					}
					if (typeof val === 'number') {
						let num = Number(condition.value);
						if (!isNaN(num)) {
							if (condition.operator === ConditionOperator.is) {
								if (val === num)
									return true;
							} else {
								if (val !== num)
									return true;
							}
						}
					} else if (typeof val === 'string') {
						if (condition.operator === ConditionOperator.is) {
							if (val == condition.value)
								return true;
						} else {
							if (val != condition.value)
								return true;
						}
					} else {
						console.log(`Invalid ticket value for condition operator '${ConditionOperator[condition.operator]}' | Value was ${condition.value}`);
						return false;
					}
					break;
				default:
					if (val instanceof Date) {
						let date = new Date(condition.value);
						switch (condition.operator) {
							case ConditionOperator.beforeAbs:
								if (val < date)
									return true;
								break;
							case ConditionOperator.afterAbs:
								if (val > date)
									return true;
								break;
							case ConditionOperator.beforeRel:
							case ConditionOperator.afterRel:
								let num = Number(condition.value);
								if (isNaN(num)) {
									console.log('Value of condition is not a number.\nTo filter tickets by an relative time the value must be a number.');
									return false;
								}
								date = API.__getRelDate(condition.range, num);
								if (condition.operator === ConditionOperator.beforeRel) {
									if (val < date)
										return true;
								} else {
									if (date < val)
										return true;
								}

						}
					}
			}
			return false;
		}

		private static __getRelDate(range: ConditionRange, val: number): Date | null {
			let date = new Date();
			switch (range) {
				case ConditionRange.minute:
					date.setMinutes(date.getMinutes() - val);
					break;
				case ConditionRange.hour:
					date.setHours(date.getHours() - val);
					break;
				case ConditionRange.day:
					date.setDate(date.getDate() - val);
					break;
				case ConditionRange.month:
					date.setMonth(date.getMonth() - val);
					break;
				case ConditionRange.year:
					date.setFullYear(date.getFullYear() - val);
					break;
				default:
					console.log(`Invalid condition range '${range}'!`);
					return null;
			}
			return date;
		}

		private static __convertTimes(obj: any) {
			for (let key in obj) {
				if (key.indexOf('_at') > -1 || key.indexOf('_time') > -1) {
					let date = new Date(obj[key]);
					if (date) {
						obj[key] = date;
					}
				}
			}
		}
	}

	export interface IOverview {
		id: number,
		name: string,
		prio: number,
		group_by: GroupBy,
		group_direction: Direction,
		organization_shared: boolean,
		out_of_office: boolean,
		active: boolean,
		condition: IConditions,
		order: { by: Order, direction: Direction },
		view: { s: Order[] },
		update_by_id: number,
		link: string,
		created_by_id: number,
		created_at: Date,
		updated_at: Date,
		role_ids: number[],
		user_ids: number[]
	}

	export interface IUser {
		id: number,
		last_login: Date,
		created_at: Date,
		updated_at: Date,
		organization_ids: number[]
	}

	export interface IOrganization {
		id: number,
		name: string,
		active: boolean,
		shared: boolean,
		created_by_id: number,
		created_at: Date,
		update_by_id: number,
		updated_at: Date,
		domain: string,
		note: string,
		domain_assignment: boolean
		member_ids: number[]
	}

	export interface IGroup {
		id: number,
		created_at: Date,
		updated_at: Date
	}

	export interface ITicket {
		id: number,
		group_id: number,
		priority_id: number,
		state_id: number,
		organization_id: number,
		number: string,
		title: string,
		owner_id: number,
		customer_id: number,
		note: string,
		first_response_at: Date,
		first_response_escalation_at: Date,
		first_response_in_min: number,
		first_response_diff_in_min: number,
		close_at: Date,
		close_escalation_at: Date,
		close_in_min: number,
		close_diff_in_min: number,
		update_escalation_at: Date,
		update_in_min: number,
		ipdate_diff_in_min: number,
		last_contact_at: Date,
		last_contact_agent_at: Date,
		last_contact_customer_at: Date,
		last_owner_update_at: Date,
		create_article_type_id: number,
		create_article_sender_id: number,
		article_count: number,
		escalation_at: Date,
		pending_time: Date,
		type: any,
		time_unit: any,
		preferences: any,
		updated_by_id: number,
		created_by_id: number,
		created_at: Date,
		updated_at: Date,
		tags: string
	}

	export interface ITicketArticle {
		id: number,
		ticket_id: number,
		type_id: number,
		sender_id: number,
		from: string,
		to: string | null,
		cc: string | null,
		subject: string | null,
		reply_to: string | null,
		message_id: number | null,
		message_id_md5: number | null,
		in_reply_to: string | null,
		content_type: string,
		references: any,
		body: string,
		internal: boolean,
		preferences: object,
		updated_by_id: number,
		created_by_id: number,
		origin_by_id: number,
		created_at: Date,
		updated_at: Date,
		attachments: object
	}

	export interface IRole {
		id: number,
		name: string,
		preferences: any,
		default_at_signup: boolean,
		active: boolean,
		note: string,
		updated_by_id: number,
		created_by_id: number,
		created_at: Date,
		updated_at: Date,
		permission_ids: number[],
		group_ids: {
			[index: string]: []
		}
	}

	export enum Direction {
		asc = 'ASC',
		desc = 'DESC'
	}

	export enum Order {
		number = 'number',
		title = 'title',
		customer = 'customer',
		organization = 'organization',
		group = 'group',
		owner = 'owner',
		state = 'state',
		pending_time = 'pending_time',
		priority = 'priority',
		article_count = 'article_count',
		time_unit = 'time_unit',
		escalation_at = 'escalation_at',
		last_contact_at = 'last_contact_at',
		last_contact_agent_at = 'last_contact_agent_at',
		last_contact_customer_at = 'last_contact_customer_at',
		first_response_at = 'first_response_at',
		close_at = 'close_at',
		created_by = 'created_by',
		created_at = 'created_at',
		updated_by = 'updated_by',
		updated_at = 'updated_at'
	}

	export enum GroupBy {
		time_unit = 'time_unit',
		article_count = 'article_count',
		created_by = 'created_by',
		customer = 'customer',
		group = 'group',
		organization = 'organization',
		owner = 'owner',
		priority = 'priority',
		state = 'state',
		title = 'title',
		updated_by = 'updated_by'
	}

	export enum ConditionOperator {
		contains = 'contains',
		containsNot = 'contains not',
		is = 'is',
		isNot = 'is not',
		beforeAbs = 'before (absolute)',
		beforeRel = 'before (relative)',
		afterAbs = 'after (absolute)',
		afterRel = 'after (relative)',
		withinAbs = 'within next (absolute)',
		withinRel = 'within last (relative)'
	}

	export enum ConditionRange {
		minute = 'minute',
		hour = 'hour',
		day = 'day',
		month = 'month',
		year = 'year'
	}

	export enum PreCondition {
		currentUserId = 'current_user.id',
		currentUserOrganization = 'current_user.organization_id',
		specific = 'specific',
		notSet = 'not_set'
	}

	export interface ICondition {
		operator: ConditionOperator,
		pre_condition?: PreCondition,
		range?: ConditionRange,
		value: string
	}

	export interface IConditions {
		[index: string]: ICondition
	}

	export function isICondition(p: object): p is ICondition {
		if (typeof p['operator'] === 'string' && (typeof p['value'] === 'string' || typeof p['value'] === 'number'))
			return true;
		return false;
	}

	export function isIConditions(p: object): p is IConditions {
		for (let key in p) {
			if (!isICondition(p[key]))
				return false;
		}
		return true;
	}
}