import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../database/entities/contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async getAllSecondaryContacts(contact: Contact) {
    const allSecondaryContacts = await this.contactRepository.find({
      where: { linkedId: contact.linkedId },
    });
    return allSecondaryContacts;
  }

  async getPrimaryContactById(contact: Contact) {
    const primaryContact = await this.contactRepository.findOne({
      where: { id: contact.linkedId },
    });
    return primaryContact;
  }

  getPrimaryContact(contacts: Contact[]) {
    return contacts.find((contact) => contact.linkPrecedence === 'primary');
  }

  async identifyContact(email: string, phoneNumber: string) {
    if (!email && !phoneNumber) {
      return;
    }

    // Fetch contacts matching either email or phone number
    const contacts = await this.contactRepository.find({
      where: [{ email }, { phoneNumber }],
    });

    const allContacts = await this.contactRepository.find();

    if (contacts.length == 0) {
      const newContact = this.contactRepository.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });
      await this.contactRepository.save(newContact);
      return this.constructResponse([], newContact);
    }

    let primaryContact = this.getPrimaryContact(contacts);

    const contactAlreadyExist = contacts.some((contact) => {
      if (email && phoneNumber) {
        return contact.email === email && contact.phoneNumber === phoneNumber;
      } else if (email) {
        return contact.email === email;
      } else {
        return contact.phoneNumber === phoneNumber;
      }
    });

    if (!contactAlreadyExist) {
      if (email && phoneNumber) {
        const contactsWithOnlyEmail = await this.contactRepository.find({
          where: { email },
        });
        const contactsWithOnlyPhoneNumber = await this.contactRepository.find({
          where: { phoneNumber },
        });
        const existingEmailWithPrimaryPrecedence = contacts.filter(
          (contact) => {
            return (
              contact.email == email && contact.linkPrecedence == 'primary'
            );
          },
        );

        const existingPhoneWithPrimaryPrecedence = contacts.filter(
          (contact) => {
            return (
              contact.phoneNumber == phoneNumber &&
              contact.linkPrecedence == 'primary'
            );
          },
        );

        if (
          existingEmailWithPrimaryPrecedence.length > 0 &&
          existingPhoneWithPrimaryPrecedence.length > 0
        ) {
          await this.contactRepository.update(
            { id: existingPhoneWithPrimaryPrecedence[0].id },
            {
              linkedId: existingEmailWithPrimaryPrecedence[0].id,
              linkPrecedence: 'secondary',
            },
          );
          const refreshExistingContacts = await this.contactRepository.find({
            where: [{ email }, { phoneNumber }],
          });

          return this.constructResponse(
            refreshExistingContacts,
            primaryContact,
          );
        }
      }

      if (!primaryContact) {
        primaryContact = await this.contactRepository.findOne({
          where: { id: contacts[0].linkedId },
        });

        if (!primaryContact) {
          throw new Error('Primary contact not found');
        }
      }

      const secondaryContact = this.contactRepository.create({
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primaryContact.id,
      });
      await this.contactRepository.save(secondaryContact);

      const refreshExistingContacts = await this.contactRepository.find({
        where: { linkedId: primaryContact.id },
      });

      return this.constructResponse(refreshExistingContacts, primaryContact);
    }
    const exactContact = contacts.find((contact) => {
      if (email && phoneNumber) {
        return contact.email == email && contact.phoneNumber == phoneNumber;
      } else if (email) {
        return contact.email == email;
      } else if (phoneNumber) {
        return contact.phoneNumber == phoneNumber;
      } else {
        return null;
      }
    });

    if (exactContact.linkPrecedence == 'primary') {
      const allSecondaryContacts =
        await this.getAllSecondaryContacts(exactContact);
      return this.constructResponse(allSecondaryContacts, exactContact);
    }

    if (exactContact.linkPrecedence == 'secondary') {
      const primaryContactById = await this.getPrimaryContactById(exactContact);
      const allSecondaryContacts =
        await this.getAllSecondaryContacts(exactContact);
      return this.constructResponse(allSecondaryContacts, primaryContactById);
    }
  }

  private constructResponse(contacts: Contact[], primaryContact: Contact) {
    const secondaryContacts = contacts.filter(
      (contact) => contact.id !== primaryContact.id,
    );

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(
          new Set(
            [
              primaryContact.email,
              ...secondaryContacts.map((contact) => contact.email),
            ].filter(Boolean),
          ),
        ),
        phoneNumbers: Array.from(
          new Set(
            [
              primaryContact.phoneNumber,
              ...secondaryContacts.map((contact) => contact.phoneNumber),
            ].filter(Boolean),
          ),
        ),
        secondaryContactIds: secondaryContacts.map((contact) => contact.id),
      },
    };
  }
}
