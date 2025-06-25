import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class ViewsController {
  @Get('/')
  @Render('index')
  home() {
    return {
      title: 'Inicio',
      currentPage: 'home',
      stats: {
        totalPets: 45,
        totalAdoptions: 128,
        totalUsers: 234,
      },
    };
  }

  @Get('/view-pets')
  @Render('pets/index')
  pets() {
    return {
      title: 'Mascotas',
      currentPage: 'pets',
      pets: [
        {
          _id: '1',
          name: 'Luna',
          breed: 'Labrador',
          age: 2,
          status: 'available',
          description: 'Una perrita muy cariñosa y juguetona',
          image: '/images/pets/luna.jpg',
        },
        {
          _id: '2',
          name: 'Max',
          breed: 'Golden Retriever',
          age: 3,
          status: 'available',
          description: 'Un perro muy leal y protector',
          image: '/images/pets/max.jpg',
        },
        {
          _id: '3',
          name: 'Mia',
          breed: 'Siamés',
          age: 1,
          status: 'available',
          description: 'Una gatita muy elegante y tranquila',
          image: '/images/pets/mia.jpg',
        },
      ],
    };
  }

  @Get('/view-adoptions')
  @Render('adoptions/index')
  adoptions() {
    return {
      title: 'Adopciones',
      currentPage: 'adoptions',
      stats: {
        totalAdoptions: 128,
        pendingAdoptions: 15,
        happyFamilies: 113,
      },
      adoptions: [
        {
          _id: '1',
          pet: {
            name: 'Luna',
            breed: 'Labrador',
            age: 2,
            image: '/images/pets/luna.jpg',
          },
          adopter: {
            name: 'Juan Pérez',
            email: 'juan.perez@email.com',
            phone: '+34 612 345 678',
          },
          status: 'pending',
          reason:
            'Siempre he querido tener una Labrador. Tengo experiencia con perros y un gran jardín donde Luna podría jugar y ejercitarse. Mi familia está muy emocionada por darle todo el amor que merece.',
          createdAt: new Date('2024-06-20'),
        },
        {
          _id: '2',
          pet: {
            name: 'Max',
            breed: 'Golden Retriever',
            age: 3,
            image: '/images/pets/max.jpg',
          },
          adopter: {
            name: 'María González',
            email: 'maria.gonzalez@email.com',
            phone: '+34 698 765 432',
          },
          status: 'approved',
          reason:
            'Mi familia y yo hemos estado buscando un compañero fiel y cariñoso. Max parece perfecto para nosotros. Tenemos experiencia con Golden Retrievers y sabemos lo especiales que son.',
          createdAt: new Date('2024-06-18'),
          approvedAt: new Date('2024-06-22'),
        },
        {
          _id: '3',
          pet: {
            name: 'Mia',
            breed: 'Siamés',
            age: 1,
            image: '/images/pets/mia.jpg',
          },
          adopter: {
            name: 'Carlos López',
            email: 'carlos.lopez@email.com',
            phone: '+34 634 567 890',
          },
          status: 'rejected',
          reason:
            'Me encantan los gatos siameses por su personalidad única. Vivo solo y creo que Mia sería una compañía perfecta para mí.',
          createdAt: new Date('2024-06-15'),
          rejectedAt: new Date('2024-06-19'),
        },
      ],
      successStories: [
        {
          petName: 'Bobby',
          familyName: 'Familia Martínez',
          story:
            'Bobby encontró su hogar perfecto con la familia Martínez. Ahora disfruta de largos paseos por el parque y es el mejor amigo de los niños.',
          image: '/images/success/bobby.jpg',
          adoptionDate: new Date('2024-05-15'),
        },
        {
          petName: 'Whiskers',
          familyName: 'Familia Rodríguez',
          story:
            'Whiskers ahora es el rey de la casa con la familia Rodríguez. Le encanta dormir al sol en su nueva terraza y jugar con sus nuevos juguetes.',
          image: '/images/success/whiskers.jpg',
          adoptionDate: new Date('2024-04-20'),
        },
        {
          petName: 'Rocky',
          familyName: 'Familia Sánchez',
          story:
            'Rocky encontró una segunda oportunidad con la familia Sánchez. Es un perro muy activo que disfruta de las caminatas matutinas y los juegos en el jardín.',
          image: '/images/success/rocky.jpg',
          adoptionDate: new Date('2024-03-10'),
        },
      ],
    };
  }
}
